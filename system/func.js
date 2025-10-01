// func.js
import fs from "fs";
import chalk from "chalk";
import crypto from "crypto";
import axios from "axios";
import moment from "moment-timezone";
import util from "util";
import * as Jimp from "jimp";
import path from "path";
import { fileURLToPath } from "url";

// 🔹 Elaina Bail imports
import {
  extractMessageContent,
  jidNormalizedUser,
  proto,
  getContentType,
  areJidsSameUser,
  generateWAMessageFromContent,
  delay,
  getDevice
} from "@whiskeysockets/baileys";

// =================== Fonctions utilitaires ===================
export const sizeFormatter = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const unixTimestampSeconds = (date = new Date()) =>
  Math.floor(date.getTime() / 1000);

export const generateMessageTag = (epoch) => {
  let tag = unixTimestampSeconds().toString();
  if (epoch) tag += ".--" + epoch;
  return tag;
};

export const processTime = (timestamp, now) =>
  moment.duration(now - moment(timestamp * 1000)).asSeconds();

export const getRandom = (ext) =>
  `${Math.floor(Math.random() * 10000)}${ext}`;

export const getBuffer = async (url, options) => {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: { DNT: 1, "Upgrade-Insecure-Request": 1 },
      ...options,
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

export const reSize = async (buffer, x, z) => {
  const img = await Jimp.read(buffer);
  return await img.resize(x, z).getBufferAsync(Jimp.MIME_JPEG);
};

export const sleep = async (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isUrl = (url) =>
  url.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi
  );

export const getGroupAdmins = (participants) =>
  participants
    .filter((p) => ["admin", "superadmin", true].includes(p.admin))
    .map((p) => p.id);

// =================== Serialize Message ===================
export const smsg = (client, m, store) => {
  if (!m) return m;

  // =================== Basic fields ===================
  m.id = m.key?.id || null;
  m.chat = m.key?.remoteJid || null;
  m.fromMe = m.key?.fromMe || false;
  m.isGroup = m.chat?.endsWith("@g.us");
  m.sender =
    m.fromMe && client.user
      ? client.user.id
      : jidNormalizedUser(m.key?.participant || m.participant || m.chat);

  // =================== Type & Message ===================
  m.mtype = getContentType(m.message);
  m.msg = m.mtype ? m.message[m.mtype] : null;
  m.body =
    m.message?.conversation ||
    m.msg?.caption ||
    m.msg?.text ||
    (m.mtype === "listResponseMessage" &&
      m.msg?.singleSelectReply?.selectedRowId) ||
    (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
    "";

  // =================== Quoted ===================
  const quotedRaw = m.msg?.contextInfo?.quotedMessage || null;
  if (quotedRaw) {
    if (typeof quotedRaw === "object") {
      const type = getContentType(quotedRaw);
      const quotedMsg = quotedRaw[type] ?? quotedRaw;

      // Si c'est une string, on wrap dans un objet
      m.quoted = (typeof quotedMsg === "string")
        ? {
            text: quotedMsg,
            mtype: type,
            id: m.msg?.contextInfo?.stanzaId || null,
            sender: jidNormalizedUser(m.msg?.contextInfo?.participant) || null,
            chat: m.chat,
          }
        : {
            ...quotedMsg,
            mtype: type,
            id: m.msg?.contextInfo?.stanzaId || null,
            sender: jidNormalizedUser(m.msg?.contextInfo?.participant) || null,
            chat: m.chat,
          };
    } else {
      // quotedRaw est une string => wrap dans un objet
      m.quoted = {
        text: quotedRaw,
        mtype: "textMessage",
        id: null,
        sender: null,
        chat: m.chat,
      };
    }
  }

  // =================== Methods ===================
  m.reply = (text, chatId = m.chat, options = {}) => {
    if (!client.sendText) return;
    return Buffer.isBuffer(text)
      ? client.sendMedia(chatId, text, "file", "", m, { ...options })
      : client.sendText(chatId, text, m, { quoted: m, ...options });
  };

  m.download = async () => {
    if (!m.msg) throw new Error("No media message present");
    const type =
      m.mtype === "imageMessage"
        ? "image"
        : m.mtype === "videoMessage"
        ? "video"
        : m.mtype === "audioMessage"
        ? "audio"
        : m.mtype === "stickerMessage"
        ? "sticker"
        : null;
    if (!type) throw new Error("Unsupported media type");
    const { downloadContentFromMessage } = await import(
      "@whiskeysockets/baileys"
    );
    const stream = await downloadContentFromMessage(m.msg, type.replace("Message", ""));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  };

  if (m.quoted) {
    m.quoted.download = async () => {
      const quoted = m.msg?.contextInfo?.quotedMessage;
      if (!quoted) throw new Error("No quoted media present");

      const type = getContentType(quoted);
      if (!["imageMessage", "videoMessage", "audioMessage", "stickerMessage"].includes(type)) {
        throw new Error("Unsupported quoted media type");
      }

      const { downloadContentFromMessage } = await import(
        "@whiskeysockets/baileys"
      );
      const stream = await downloadContentFromMessage(
        quoted[type],
        type.replace("Message", "")
      );
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      return Buffer.concat(chunks);
    };
  }

  return m;
};

// =================== Hot reload ===================
const __filename = fileURLToPath(import.meta.url);
fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(chalk.redBright(`Update ${__filename}`));
  import(`${path.resolve(__filename)}?update=${Date.now()}`);
});