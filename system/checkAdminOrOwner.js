// ==================== checkAdminOrOwner.js ====================
import decodeJid from './decodeJid.js';
import config from '../config.js';

/**
 * Vérifie si un utilisateur est Owner, Admin, Sudo ou BotAdmin
 * @param {object} socket - Le client Baileys
 * @param {string} chatId - ID du chat (groupe ou privé)
 * @param {string} sender - JID de l’utilisateur à vérifier
 * @param {Array} participants - Liste des participants du groupe
 * @param {object} metadata - Metadata du groupe
 */
export default async function checkAdminOrOwner(socket, chatId, sender, participants = [], metadata = null) {
  const isGroup = chatId.endsWith('@g.us');

  // Nettoyage des numéros
  const ownerNumbers = config.OWNER_NUMBER.split(',')
    .map(o => o.trim().replace(/\D/g, ''));
  const sudoNumbers = (config.SUDO || []).map(s => s.trim().replace(/\D/g, ''));
  const senderNumber = decodeJid(sender).split('@')[0].replace(/\D/g, '');

  // Vérif si Owner (config)
  const isBotOwner = ownerNumbers.includes(senderNumber);

  // Vérif si Sudo
  const isSudo = sudoNumbers.includes(senderNumber);

  // Si pas un groupe
  if (!isGroup) {
    return {
      isAdmin: false,
      isOwner: isBotOwner,
      isSudo,
      isAdminOrOwner: isBotOwner || isSudo,
      participant: null
    };
  }

  // Si groupe → récupérer metadata
  try {
    if (!metadata) metadata = await socket.groupMetadata(chatId);
    if (!participants || participants.length === 0) participants = metadata.participants || [];
  } catch (e) {
    console.error('❌ Impossible de récupérer groupMetadata:', e);
    return {
      isAdmin: false,
      isOwner: isBotOwner,
      isSudo,
      isAdminOrOwner: isBotOwner || isSudo,
      participant: null
    };
  }

  // Vérifie si le sender est dans la liste des participants
  const participant = participants.find(p => {
    const jidToCheck = decodeJid(p.jid || p.id || '');
    return jidToCheck === decodeJid(sender);
  }) || null;

  // Vérifie si Admin de groupe
  const isAdmin = !!participant && (
    participant.admin === 'admin' ||
    participant.admin === 'superadmin' ||
    participant.role === 'admin' ||
    participant.role === 'superadmin' ||
    participant.isAdmin === true ||
    participant.isSuperAdmin === true
  );

  // Vérifie si Owner du groupe
  const isGroupOwner = metadata.owner && decodeJid(metadata.owner) === decodeJid(sender);

  // Final
  const isOwnerUser = isBotOwner || isGroupOwner;

  return {
    isAdmin,
    isOwner: isOwnerUser,
    isSudo,
    isAdminOrOwner: isAdmin || isOwnerUser || isSudo,
    participant
  };
}