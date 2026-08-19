// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Anti Virtex — Deteksi & blokir pesan berbahaya (virus WhatsApp)
 * Deteksi: pesan terlalu panjang, karakter aneh, sticker jahat
 * .antivirtex on/off — Toggle (admin grup)
 * .antivirtex status — Cek status
 */
import config from "../../config.js";

const VIRTEX_PATTERNS = [
  /𝕏|𝕐|𝕑|𝔸|𝔹|ℂ|𝔻|𝔼|𝔽|𝔾|ℍ/g,  // Unicode math chars
  /͏/g,  // Invisible chars
  /‏|‎/g,  // RTL/LTR marks
  /﹀|︀|︁|︂|︃|︄|︅|︆|︇|︈|︉|︊|︋|︌|︍|︎|️/g,  // Variation selectors
];

const MAX_MSG_LENGTH = 5000; // Pesan >5000 char = suspicious
const MAX_STICKER_SIZE = 500000; // Sticker >500KB = suspicious

const groupStates = new Map();

function getGroupState(jid) {
  if (!groupStates.has(jid)) {
    groupStates.set(jid, { enabled: true, blocked: 0 });
  }
  return groupStates.get(jid);
}

function detectVirtex(text) {
  if (!text) return false;
  if (text.length > MAX_MSG_LENGTH) return true;
  for (const pattern of VIRTEX_PATTERNS) {
    if (pattern.test(text)) {
      const matches = text.match(pattern);
      if (matches && matches.length > 100) return true;
    }
  }
  // Cek karakter non-printable berlebihan
  const nonPrintable = text.match(/[\x00-\x08\x0E-\x1F\x7F]/g);
  if (nonPrintable && nonPrintable.length > 50) return true;
  return false;
}

async function handler(m, { sock, db, groupMetadata }) {
  const command = m.command;
  const args = (m.text || "").toLowerCase().trim();
  const isGroup = m.chat?.endsWith("@g.us");

  if (command === "antivirtex") {
    if (!isGroup) return m.reply("❌ Hanya untuk grup!");
    
    // Cek admin
    const meta = groupMetadata || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return m.reply("❌ Gagal mendapatkan info grup.");
    const isAdmin = meta.participants?.some(p => p.id === m.sender && (p.admin === "admin" || p.admin === "superadmin"));
    const isOwner = config.owner?.numbers?.some(
      (n) => m.sender === n + "@s.whatsapp.net"
    ) || false;
    if (!isAdmin && !isOwner) return m.reply("❌ Admin/Owner only!");

    const state = getGroupState(m.chat);

    if (args === "on" || args === "enable") {
      state.enabled = true;
      if (db?.setGroupSetting) db.setGroupSetting(m.chat, "antivirtex", true);
      return m.reply("✅ *Anti Virtex* aktif di grup ini!\n\nBot akan hapus pesan berbahaya otomatis.");
    }
    if (args === "off" || args === "disable") {
      state.enabled = false;
      if (db?.setGroupSetting) db.setGroupSetting(m.chat, "antivirtex", false);
      return m.reply("⛔ *Anti Virtex* dinonaktifkan.");
    }
    if (args === "status") {
      return m.reply("Anti Virtex: *" + (state.enabled ? "ON ✅" : "OFF ⛔") + "*\nBlocked: *" + state.blocked + "* pesan");
    }
    return m.reply("Anti Virtex: *" + (state.enabled ? "ON ✅" : "OFF ⛔") + "*\n\n.antivirtex on/off — Toggle\n.antivirtex status — Cek status");
  }

  return { handled: false };
}

// Export untuk dipakai di message handler
export function checkVirtex(text, stickerSize) {
  if (detectVirtex(text)) return { isVirtex: true, reason: "Pesan mengandung karakter berbahaya" };
  if (stickerSize && stickerSize > MAX_STICKER_SIZE) return { isVirtex: true, reason: "Sticker size mencurigakan (" + (stickerSize/1000).toFixed(0) + "KB)" };
  return { isVirtex: false };
}

export function isAntiVirtexEnabled(jid) {
  const state = groupStates.get(jid);
  return state ? state.enabled : true;
}

export function markBlocked(jid) {
  const state = getGroupState(jid);
  state.blocked++;
}

const pluginConfig = {
  name: "antivirtex",
  alias: ["antivirtex", "antibug"],
  category: "group",
  description: "Anti virus/virtex WhatsApp — blokir pesan & sticker berbahaya",
  usage: ".antivirtex on/off/status",
  isOwner: false,
  isGroup: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
