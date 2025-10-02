// ==================== commands/close.js ====================

async function close(socket, m, msg, args, extra) {

  const { isGroup, isAdmins, chatType } = extra;

  // Vérifier si c'est un groupe

  if (!isGroup) {

    return socket.sendMessage(m.chat, { 

      text: "❌ Cette commande ne peut être utilisée que dans un groupe." 

    }, { quoted: m });

  }

  // Vérifier les permissions

  if (!isAdmins) {

    return socket.sendMessage(m.chat, { 

      text: "⛔ Seuls les administrateurs peuvent fermer le groupe." 

    }, { quoted: m });

  }

  try {

    // Fermer le groupe

    await socket.groupSettingUpdate(m.chat, 'announcement');

    

    await socket.sendMessage(m.chat, { 

      text: "🔒 Le groupe a été fermé avec succès.\n\nSeuls les administrateurs peuvent envoyer des messages." 

    }, { quoted: m });

  } catch (error) {

    console.error("❌ Erreur lors de la fermeture du groupe:", error);

    await socket.sendMessage(m.chat, { 

      text: "❌ Une erreur est survenue lors de la fermeture du groupe." 

    }, { quoted: m });

  }

}

export default { 

  name: "close", 

  run: close,

  adminOnly: true,

  groupOnly: true 

};