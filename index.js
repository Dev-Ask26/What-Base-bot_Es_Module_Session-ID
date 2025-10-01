// ==================== index.js ====================
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import pino from 'pino';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Import Handler and smsg and Config
import config from './config.js';
import handler from "./handler.js";
import { smsg } from './system/func.js';

// <-- Whatsapp import module Baileys -->
import { makeWASocket, jidDecode, useMultiFileAuthState } from '@whiskeysockets/baileys';

// ==================== ESM __dirname ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== Globals ====================
global.groupSettings = {};
global.menuState = {};
global.groupCache = {};
if (!globalThis.crypto?.subtle) globalThis.crypto = crypto.webcrypto;
global.PREFIX = config.PREFIX;
global.owner = [config.OWNER_NUMBER];
global.SESSION_ID = config.SESSION_ID;

// ==================== MegaJS ====================
let File;
try {
  const megajs = await import('megajs');
  File = megajs?.default?.File || megajs.File;
} catch {
  console.log('📦 Installation de megajs...');
  execSync('npm install megajs', { stdio: 'inherit' });
  const megajs = await import('megajs');
  File = megajs?.default?.File || megajs.File;
}

// ==================== Session ====================
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// ==================== Charger session Mega ====================
async function loadSessionFromMega() {
  try {
    if (fs.existsSync(credsPath)) {
      console.log("✅ Session locale déjà présente, pas besoin de retélécharger depuis Mega.");
      return false;
    }
    if (!global.SESSION_ID.startsWith('blackking~')) return false;

    const [fileID, key] = global.SESSION_ID.replace('blackking~', '').split('#');
    if (!fileID || !key) throw new Error('❌ SESSION_ID invalide');

    console.log(`🔄 Tentative de téléchargement Mega : fileID=${fileID}, key=${key}`);
    const file = File.fromURL(`https://mega.nz/file/${fileID}#${key}`);
    await file.loadAttributes();

    const data = await new Promise((resolve, reject) =>
      file.download((err, d) => (err ? reject(err) : resolve(d)))
    );

    await fs.promises.writeFile(credsPath, data);
    console.log('✅ Session téléchargée et sauvegardée localement (creds.json).');
    return true;
  } catch (err) {
    console.warn('⚠ Impossible de charger la session depuis Mega :', err);
    return false;
  }
}

// ==================== Lancer le bot ====================
async function StartBot() {
  try {
    await loadSessionFromMega();

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const socket = makeWASocket({
      logger: pino({ level: 'silent' }),
      auth: state,
      browser: ['', 'Safari', '3.3'],
    });

    socket.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
      }
      return jid;
    };

    // ==================== Connexion ====================
    socket.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) console.log(chalk.yellow('📷 QR Code reçu, scanne-le avec WhatsApp :'), qr);
      if (connection === 'open') {
        console.log(chalk.green('✅ Bot connecté !'));

        //Ton numéro forcé ici :
        const creatorJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
        const message = 'bot actif';
        try { 
          await socket.sendMessage(creatorJid, { text: message }); 
        } catch (err) { 
          console.error(err); 
        }
      } else if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error || 'unknown';
        console.log(chalk.red('❌ Déconnecté :'), reason);
        console.log(chalk.yellow('⏳ Redémarrage du bot dans 5s...'));
        setTimeout(StartBot, 5000);
      }
    });

    // ==================== Messages ====================
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (!msg?.message) continue;
        const m = smsg(socket, msg);
        try { 
          await handler(socket, m, msg, undefined); 
        } catch (err) { 
          console.error('❌ Message error:', err); 
        }
      }
    });

    socket.ev.on('creds.update', saveCreds);
    return socket;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// ==================== Execute ====================
StartBot();