// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Channel notification utilities
 * Send registration/new-user events to the configured WhatsApp channel/newsletter
 */

import config from "../../config.js";

let channelCache = null;
let channelLastSend = 0;
const CHANNEL_COOLDOWN_MS = 1000;

async function getChannelId(botConfig = config) {
  if (channelCache) return channelCache;

  const raw = botConfig?.saluran?.id || "";
  const trimmed = String(raw).trim();

  if (!trimmed) return null;

  const withSuffix = trimmed.includes("@") ? trimmed : `${trimmed}@newsletter`;
  channelCache = withSuffix;
  return channelCache;
}

async function sendChannelMessage(sock, text, opts = {}) {
  const channelId = await getChannelId(config);
  if (!channelId || !sock) return false;

  const now = Date.now();
  if (now - channelLastSend < CHANNEL_COOLDOWN_MS) {
    return false;
  }

  try {
    await sock.sendMessage(channelId, {
      text: String(text).slice(0, 4096),
      ...opts,
    });
    channelLastSend = now;
    return true;
  } catch {
    return false;
  }
}

async function notifyNewUser(sock, user) {
  const name = user?.name || user?.pushName || "Unknown";
  const id = user?.id || user?.sender || "unknown";
  const username = user?.username || "-";
  const time = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  const text =
    `📥 *PENGGUNA BARU*\n` +
    `┃ ◦ Nama: *${name}*\n` +
    `┃ ◦ ID: \`${id}\`\n` +
    `┃ ◦ Username: *@${username}*\n` +
    `┃ ◦ Waktu: *${time}*`;

  return sendChannelMessage(sock, text);
}

async function notifyRegistration(sock, user) {
  const name = user?.name || user?.pushName || "Unknown";
  const id = user?.id || user?.sender || "unknown";
  const username = user?.username || "-";
  const time = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  const text =
    `✅ *PENDAFTARAN BARU*\n` +
    `┃ ◦ Nama: *${name}*\n` +
    `┃ ◦ ID: \`${id}\`\n` +
    `┃ ◦ Username: *@${username}*\n` +
    `┃ ◦ Waktu: *${time}*`;

  return sendChannelMessage(sock, text);
}

async function notifyBroadcast(sock, message, sender) {
  const name = sender?.name || sender?.pushName || "Owner";
  const time = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  const text =
    `📢 *BROADCAST*\n` +
    `┃ ◦ Dari: *${name}*\n` +
    `┃ ◦ Waktu: *${time}*\n` +
    `┃ ◦ Pesan:\n${String(message).slice(0, 2000)}`;

  return sendChannelMessage(sock, text);
}

export {
  getChannelId,
  sendChannelMessage,
  notifyNewUser,
  notifyRegistration,
  notifyBroadcast,
};
