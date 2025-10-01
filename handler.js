// ==================== handler.js ==================== 
import fs from "fs"; 
import path from "path"; 
import { fileURLToPath } from "url"; 
import config from "./config.js";

const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename); const commands = new Map();

async function loadCommands() { const commandsDir = path.join(__dirname, "commands"); const files = fs.readdirSync(commandsDir); for (const file of files) { if (file.endsWith(".js")) { try { const { default: cmd } = await import(./commands/${file}); if (cmd?.name && typeof cmd.run === "function") commands.set(cmd.name, cmd.run); } catch (err) { console.error(Erreur chargement ${file}:, err); } } } } await loadCommands();

function getChatType(jid) { if (jid.endsWith("@g.us")) return "group"; if (jid.endsWith("@s.whatsapp.net")) return "dm"; if (jid.endsWith("@newsletter")) return "channel"; return "community"; }

async function handler(socket, m, rawMsg) { try { let body = ( m.mtype === "conversation" ? m.message.conversation : m.mtype === "imageMessage" ? m.message.imageMessage.caption : m.mtype === "videoMessage" ? m.message.videoMessage.caption : m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId : m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId : m.mtype === "interactiveResponseMessage" ? (() => { try { return JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id; } catch { return ""; } })() : m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId : m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.message.interactiveResponseMessage?.nativeFlowResponseMessage || m.text : "" ); if (body == undefined) body = ""; var budy = (typeof m.text === "string" ? m.text : "");

if (!body.startsWith(config.PREFIX)) return;
const args = body.slice(config.PREFIX.length).trim().split(/ +/g);
const command = args.shift().toLowerCase();
const sender = m.sender || m.key.participant || m.key.remoteJid;
const isOwner = sender?.includes(config.OWNER_NUMBER);
const isSudo = config.SUDO.some((num) => sender?.includes(num));
const botNumber = socket.user.id.split(":")[0] + "@s.whatsapp.net";
const chatId = m.key.remoteJid;
const groupMetadata = await socket.groupMetadata(chatId);
const admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);


if (config.MODE === "private" && !isOwner && !isSudo) {
  return socket.sendMessage(m.chat, { text: "⚠️ Le bot est en mode privé. Seul l'owner et les sudo peuvent utiliser les commandes." }, { quoted: rawMsg });
}

if (!commands.has(command)) {
  return socket.sendMessage(m.chat, { text: `❌ Commande inconnue: ${command}` }, { quoted: rawMsg });
}

const chatType = getChatType(m.chat);
await commands.get(command)(m, socket, args, body, chatType, budy);

} catch (err) { console.error("Erreur Handler:", err); try { await socket.sendMessage(m.chat, { text: "⚠️ Une erreur est survenue." }, { quoted: rawMsg }); } catch {} } }

export default handler;
