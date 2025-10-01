# What-Base-bot_Es_Module_Session-ID

WhatsApp Bot - Base Éducative Simple

Créé par Dev Ask

Cette base de bot WhatsApp est pour apprentissage et utilise ES Module. Vous pouvez facilement ajouter des commandes normales ou de groupe, et apprendre à gérer le bot.


---

1. Structure du projet

project/
│
├─ index.js         # Point d'entrée du bot
├─ config.js        # Configuration globale (prefix, owner, mode, sudo)
├─ handler.js       # Gère les messages et exécute les commandes
├─ commands/        # Contient toutes les commandes
│   ├─ ping.js      # Exemple de commande simple
│   ├─ mode.js      # Passe le bot public/private
│   ├─ sudo.js      # Gère les sudo users
│   ├─ setprefix.js # Change le préfixe du bot


---

2. Exemple de commande simple (ping)

// commands/ping.js

async function ping(m, socket) {
  await socket.sendMessage(m.chat, { text: 'Pong !' }, { quoted: m });
}

export default { name: 'ping', run: ping };

3. Exemple de commande pour groupe

// commands/close.js

async function close(m, socket) {
  if (!m.isGroup || !m.isAdmin || !m.isBotAdmin) return;
  await socket.groupSettingUpdate(m.chat, 'announcement');
  await socket.sendMessage(m.chat, { text: '🔒 Groupe fermé !' }, { quoted: m });
}

export default { name: 'close', run: close };


---

4. Exemple commande sticker

// commands/sticker.js

async function sticker(m, socket) {
  if (!m.mtype === 'imageMessage') return;
  const buffer = m.message.imageMessage.image;
  await socket.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
}

export default { name: 'sticker', run: sticker };


---

5. Handler.js simplifié

import fs from 'fs';
import path from 'path';
import config from './config.js';

const commands = new Map();

// Charger commandes
fs.readdirSync('./commands').forEach(async file => {
  if(file.endsWith('.js')) {
    const { default: cmd } = await import(`./commands/${file}`);
    commands.set(cmd.name, cmd.run);
  }
});

export default async function handler(socket, m) {
  let body = m.message?.conversation || '';
  if(!body.startsWith(config.PREFIX)) return;

  const args = body.slice(config.PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const sender = m.sender;
  const isOwner = sender.includes(config.OWNER_NUMBER);
  const isSudo = config.SUDO.includes(sender);

  if(config.MODE === 'private' && !isOwner && !isSudo) return;

  if(commands.has(command)) await commands.get(command)(m, socket, args);
}


---

6. Index.js simplifié

import { makeWASocket, useMultiFileAuthState } from '@rexxhayanasi/elaina-bail';
import handler from './handler.js';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ auth: state });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for(const m of messages) await handler(sock, m);
  });
  sock.ev.on('creds.update', saveCreds);
}

startBot();


---

7. Package.json et modules ES

{
  "name": "whatsapp-bot",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@rexxhayanasi/elaina-bail": "latest",
    "pino": "latest"
  }
}

Importer un module ES

import fs from 'fs';
import path from 'path';


---

8. Ajouter de nouvelles commandes

1. Créez un fichier .js dans commands/.


2. Exposez name et run.


3. Le handler charge automatiquement les commandes.



Exemple rapide :

async function salut(m, socket) {
  await socket.sendMessage(m.chat, { text: 'Salut !' }, { quoted: m });
}
export default { name: 'salut', run: salut };


---

Base éducative pour apprendre à coder un bot WhatsApp en ES Module.

