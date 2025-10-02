// ==================== commands/open.js ====================
async function open(socket, m, msg, args, extra) {
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
      text: "⛔ Seuls les administrateurs peuvent rouvrir le groupe." 
    }, { quoted: m });
  }

  try {
    // Rouvrir le groupe
    await socket.groupSettingUpdate(m.chat, 'not_announcement');
    
    await socket.sendMessage(m.chat, { 
      text: "🔓 Le groupe a été rouvert avec succès.\n\nTous les membres peuvent maintenant envoyer des messages." 
    }, { quoted: m });

  } catch (error) {
    console.error("❌ Erreur lors de l'ouverture du groupe:", error);
    await socket.sendMessage(m.chat, { 
      text: "❌ Une erreur est survenue lors de l'ouverture du groupe." 
    }, { quoted: m });
  }
}

export default { 
  name: "open", 
  run: open,
  adminOnly: true,
  groupOnly: true 
};