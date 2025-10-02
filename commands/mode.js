// ==================== commands/mode.js ====================
import config from "../config.js";

async function mode(socket, m, msg, args, extra) {
  const { isOwner, body, budy, chatType } = extra;

  // Vérifie si c'est l'owner
  if (!isOwner) {
    return socket.sendMessage(m.chat, { text: "❌ Seul l'owner peut changer le mode du bot." }, { quoted: m });
  }

  // Vérifie si un argument est fourni
  if (!args[0]) {
    const currentMode = config.MODE === "public" ? "🌍 PUBLIC" : "🔒 PRIVÉ";
    return socket.sendMessage(m.chat, { 
      text: `⚙️ *Gestion du Mode*\n\n📌 Mode actuel: ${currentMode}\n\nUsage: ${config.PREFIX}mode [public|private]` 
    }, { quoted: m });
  }

  // Changement de mode
  switch (args[0].toLowerCase()) {
    case "public":
      config.MODE = "public";
      await socket.sendMessage(m.chat, { 
        text: "🌍 *Mode PUBLIC Activé*\n\nTous les utilisateurs peuvent maintenant utiliser le bot." 
      }, { quoted: m });
      break;

    case "private":
      config.MODE = "private";
      await socket.sendMessage(m.chat, { 
        text: "🔒 *Mode PRIVÉ Activé*\n\nSeuls l'owner et les sudo peuvent utiliser le bot." 
      }, { quoted: m });
      break;

    case "status":
    case "info":
      const status = config.MODE === "public" ? "🌍 PUBLIC" : "🔒 PRIVÉ";
      const description = config.MODE === "public" 
        ? "Tous les utilisateurs peuvent utiliser le bot" 
        : "Seuls l'owner et les sudo peuvent utiliser le bot";
      
      await socket.sendMessage(m.chat, { 
        text: `📊 *Statut du Mode*\n\n🔄 Mode: ${status}\n📝 Description: ${description}` 
      }, { quoted: m });
      break;

    default:
      await socket.sendMessage(m.chat, { 
        text: `❌ Mode invalide\n\nUsage: ${config.PREFIX}mode [public|private|status]` 
      }, { quoted: m });
      break;
  }
}

export default { 
  name: "mode", 
  run: mode,
  ownerOnly: true 
};