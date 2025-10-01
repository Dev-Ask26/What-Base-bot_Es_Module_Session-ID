// ==================== commands/sudo.js ====================
import config from "../config.js";

async function sudo(m, socket, args) {
  const sender = m.sender || m.key.participant || m.key.remoteJid;
  const isOwner = sender?.includes(config.OWNER_NUMBER);

  if (!isOwner) {
    return socket.sendMessage(m.chat, { text: "❌ Seul l'owner peut gérer les sudo." }, { quoted: m });
  }

  if (!args[0]) {
    return socket.sendMessage(m.chat, { text: "⚙️ Usage: !sudo [add|remove] <num>" }, { quoted: m });
  }

  switch (args[0].toLowerCase()) {
    case "add":
      if (!args[1]) return socket.sendMessage(m.chat, { text: "❌ Donne un numéro à ajouter." }, { quoted: m });
      if (!config.SUDO.includes(args[1])) config.SUDO.push(args[1]);
      await socket.sendMessage(m.chat, { text: `✅ Ajouté en sudo: ${args[1]}` }, { quoted: m });
      break;

    case "remove":
    case "del":
      if (!args[1]) return socket.sendMessage(m.chat, { text: "❌ Donne un numéro à retirer." }, { quoted: m });
      config.SUDO = config.SUDO.filter((n) => n !== args[1]);
      await socket.sendMessage(m.chat, { text: `🗑️ Retiré des sudo: ${args[1]}` }, { quoted: m });
      break;

    default:
      await socket.sendMessage(m.chat, { text: "⚙️ Usage: !sudo [add|remove] <num>" }, { quoted: m });
      break;
  }
}

export default { name: "sudo", run: sudo };