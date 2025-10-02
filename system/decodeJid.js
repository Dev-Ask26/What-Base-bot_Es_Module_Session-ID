// ==================== decodeJid.js ====================
export default function decodeJid(jid) {
  if (!jid) return jid;

  // Retire tout après les ":" pour gérer multi-device
  jid = jid.split(':')[0];

  // Convertit @c.us en @s.whatsapp.net
  if (jid.endsWith('@c.us')) jid = jid.replace('@c.us', '@s.whatsapp.net');

  return jid.toLowerCase();
}