// ==================== commands/mode.js ====================
import config from "../config.js";

async function mode(m, socket, args) {
  const sender = m.sender || m.key.participant || m.key.remoteJid;
  const isOwner = sender?.includes(config.OWNER_NUMBER);

  if (!isOwner) {
    return socket.sendMessage(m.chat, { text: "❌ Seul l'owner peut changer le mode du bot." }, { quoted: m });
  }

  if (!args[0]) {
    return socket.sendMessage(m.chat, { text: `⚙️ Usage: !mode [public|private]\n📌 Mode actuel: *${config.MODE}*` }, { quoted: m });
  }

  switch (args[0].toLowerCase()) {
    case "public":
      config.MODE = "public";
      await socket.sendMessage(m.chat, { text: "🌍 Le bot est maintenant en mode PUBLIC" }, { quoted: m });
      break;

    case "private":
      config.MODE = "private";
      await socket.sendMessage(m.chat, { text: "🔒 Le bot est maintenant en mode PRIVÉ" }, { quoted: m });
      break;

    default:
      await socket.sendMessage(m.chat, { text: "❌ Choisis entre: public / private" }, { quoted: m });
      break;
  }
}

export default { name: "mode", run: mode };