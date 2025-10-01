// ==================== commands/setprefix.js ====================
import config from "../config.js";

async function setprefix(m, socket, args) {
  const sender = m.sender || m.key.participant || m.key.remoteJid;
  const isOwner = sender?.includes(config.OWNER_NUMBER);

  if (!isOwner) {
    return socket.sendMessage(m.chat, { text: "❌ Seul l'owner peut changer le préfixe." }, { quoted: m });
  }

  if (!args[0]) {
    return socket.sendMessage(m.chat, { text: `⚙️ Usage: !setprefix <nouveau_prefix>\n📌 Préfixe actuel: *${config.PREFIX}*` }, { quoted: m });
  }

  config.PREFIX = args[0];
  await socket.sendMessage(m.chat, { text: `✅ Préfixe changé avec succès!\n📌 Nouveau préfixe: *${config.PREFIX}*` }, { quoted: m });
}

export default { name: "setprefix", run: setprefix };