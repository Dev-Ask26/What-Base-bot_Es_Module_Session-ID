// ==================== commands/setprefix.js ====================
import config from "../config.js";

async function setprefix(socket, m, msg, args, extra) {
  const { isOwner, body, budy, chatType } = extra;

  if (!isOwner) {
    return socket.sendMessage(m.chat, { text: "❌ Seul l'owner peut changer le préfixe." }, { quoted: m });
  }

  if (!args[0]) {
    return socket.sendMessage(m.chat, { 
      text: `⚙️ *Gestion du Préfixe*\n\n📌 Préfixe actuel: *${config.PREFIX}*\n\nUsage: ${config.PREFIX}setprefix <nouveau_préfixe>` 
    }, { quoted: m });
  }

  const newPrefix = args[0].trim();
  
  // Validation du préfixe
  if (newPrefix.length > 3) {
    return socket.sendMessage(m.chat, { 
      text: "❌ Le préfixe ne peut pas dépasser 3 caractères." 
    }, { quoted: m });
  }

  if (newPrefix.includes(' ') || newPrefix.includes('\n')) {
    return socket.sendMessage(m.chat, { 
      text: "❌ Le préfixe ne peut pas contenir d'espaces ou de sauts de ligne." 
    }, { quoted: m });
  }

  // Sauvegarde de l'ancien préfixe
  const oldPrefix = config.PREFIX;
  config.PREFIX = newPrefix;

  await socket.sendMessage(m.chat, { 
    text: `✅ *Préfixe modifié avec succès!*\n\n📌 Ancien préfixe: *${oldPrefix}*\n🆕 Nouveau préfixe: *${config.PREFIX}*` 
  }, { quoted: m });
}

export default { 
  name: "setprefix", 
  run: setprefix,
  ownerOnly: true 
};