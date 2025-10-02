// ==================== commands/sudo.js ====================

import config from "../config.js";

async function sudo(socket, m, msg, args, extra) {

  const { isOwner, body, budy, chatType } = extra;

  if (!isOwner) {

    return socket.sendMessage(m.chat, { text: "❌ Seul l'owner peut gérer les sudo." }, { quoted: m });

  }

  if (!args[0]) {

    return socket.sendMessage(m.chat, { text: "⚙️ Usage: !sudo [add|remove] <num>" }, { quoted: m });

  }

  switch (args[0].toLowerCase()) {

    case "add":

      if (!args[1]) return socket.sendMessage(m.chat, { text: "❌ Donne un numéro à ajouter." }, { quoted: m });

      if (!config.SUDO.includes(args[1])) {

        config.SUDO.push(args[1]);

        await socket.sendMessage(m.chat, { text: `✅ Ajouté en sudo: ${args[1]}` }, { quoted: m });

      } else {

        await socket.sendMessage(m.chat, { text: `ℹ️ Ce numéro est déjà sudo.` }, { quoted: m });

      }

      break;

    case "remove":

    case "del":

      if (!args[1]) return socket.sendMessage(m.chat, { text: "❌ Donne un numéro à retirer." }, { quoted: m });

      if (config.SUDO.includes(args[1])) {

        config.SUDO = config.SUDO.filter((n) => n !== args[1]);

        await socket.sendMessage(m.chat, { text: `🗑️ Retiré des sudo: ${args[1]}` }, { quoted: m });

      } else {

        await socket.sendMessage(m.chat, { text: `ℹ️ Ce numéro n'est pas dans la liste sudo.` }, { quoted: m });

      }

      break;

    case "list":

      const sudoList = config.SUDO.length > 0 

        ? `📋 Liste des sudo:\n${config.SUDO.map((n, i) => `${i + 1}. ${n}`).join('\n')}`

        : "📋 Aucun sudo configuré.";

      await socket.sendMessage(m.chat, { text: sudoList }, { quoted: m });

      break;

    default:

      await socket.sendMessage(m.chat, { text: "⚙️ Usage: !sudo [add|remove|list] <num>" }, { quoted: m });

      break;

  }

}

export default { name: "sudo", owenrOnly:true, run: sudo };