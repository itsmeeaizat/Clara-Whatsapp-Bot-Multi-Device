/**
 * Anti Spam Chat — Deteksi & blokir spam di private chat (bukan grup)
 * .antispamchat on/off — Toggle (owner only, setting global)
 * .antispamchat limit <jumlah> — Set max pesan per detik (default 5)
 * .antispamchat warn <jumlah> — Set max warning sebelum block (default 3)
 * .antispamchat status — Cek status
 * .antispamchat reset @user — Reset warning user
 *
 * Deteksi: flood pesan cepat, pesan duplicate, pesan panjang berulang
 * Action: warn -> mute -> block
 */
import config from "../../config.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const STATE = { enabled: true, limit: 5, maxWarn: 3, windowMs: 5000 };
const userWarnings = new Map(); // jid -> { count, lastReset, messages: [] }

function getUserWarn(jid) {
  if (!userWarnings.has(jid)) {
    userWarnings.set(jid, { count: 0, lastReset: Date.now(), messages: [], lastMsgTime: 0, floodCount: 0 });
  }
  return userWarnings.get(jid);
}

function isOwner(m) {
  return config.owner?.numbers?.some(n => m.sender === n + "@s.whatsapp.net") || false;
}

async function handler(m, { sock, db }) {
  const command = m.command;
  const args = (m.text || "").toLowerCase().trim();

  if (command === "antispamchat") {
    if (!isOwner(m)) return m.reply("Owner only!");
    const sub = args.split(" ")[0];
    const val = args.split(" ")[1];

    if (sub === "on" || sub === "enable") {
      STATE.enabled = true;
      const dbInst = getDatabase();
      if (dbInst?.setting) dbInst.setting("antispamchat", true);
      return m.reply("Anti Spam Chat aktif! Spam di private chat akan dideteksi & diblokir.");
    }
    if (sub === "off" || sub === "disable") {
      STATE.enabled = false;
      const dbInst = getDatabase();
      if (dbInst?.setting) dbInst.setting("antispamchat", false);
      return m.reply("Anti Spam Chat dinonaktifkan.");
    }
    if (sub === "limit") {
      const n = parseInt(val);
      if (!n || n < 1 || n > 50) return m.reply("Format: .antispamchat limit <1-50>\nContoh: .antispamchat limit 5");
      STATE.limit = n;
      return m.reply("Max pesan diatur ke " + n + " per " + (STATE.windowMs / 1000) + " detik.");
    }
    if (sub === "warn") {
      const n = parseInt(val);
      if (!n || n < 1 || n > 10) return m.reply("Format: .antispamchat warn <1-10>\nContoh: .antispamchat warn 3");
      STATE.maxWarn = n;
      return m.reply("Max warning sebelum block diatur ke " + n + ".");
    }
    if (sub === "reset") {
      const target = m.mentionedJid?.[0] || m.quoted?.sender;
      if (!target) return m.reply("Tag user atau reply pesannya.\nContoh: .antispamchat reset @user");
      userWarnings.delete(target);
      return m.reply("Warning @" + target.split("@")[0] + " direset.", { mentions: [target] });
    }
    if (sub === "status") {
      const totalWarn = userWarnings.size;
      const blocked = Array.from(userWarnings.values()).filter(u => u.count >= STATE.maxWarn).length;
      return m.reply(
        "Anti Spam Chat: " + (STATE.enabled ? "ON" : "OFF") +
        "\nLimit: " + STATE.limit + " pesan / " + (STATE.windowMs / 1000) + " detik" +
        "\nMax Warning: " + STATE.maxWarn +
        "\nTotal warned: " + totalWarn + " user" +
        "\nBlocked: " + blocked + " user"
      );
    }

    return m.reply(
      "Anti Spam Chat: " + (STATE.enabled ? "ON" : "OFF") + "\n\n" +
      ".antispamchat on/off — Toggle\n" +
      ".antispamchat limit <n> — Max pesan per detik\n" +
      ".antispamchat warn <n> — Max warning sebelum block\n" +
      ".antispamchat reset @user — Reset warning\n" +
      ".antispamchat status — Cek status"
    );
  }

  return { handled: false };
}

// Export untuk message handler
export function checkSpamChat(jid, text) {
  if (!STATE.enabled) return { isSpam: false };
  const user = getUserWarn(jid);
  const now = Date.now();

  // Reset flood counter jika sudah lewat window
  if (now - user.lastReset > STATE.windowMs) {
    user.floodCount = 0;
    user.lastReset = now;
  }

  user.floodCount++;

  // Cek flood
  if (user.floodCount > STATE.limit) {
    user.count++;
    if (user.count >= STATE.maxWarn) {
      return { isSpam: true, action: "block", reason: "Flood: " + user.floodCount + " pesan dalam " + (STATE.windowMs / 1000) + " detik" };
    }
    return { isSpam: true, action: "warn", reason: "Flood detected (" + user.floodCount + " pesan cepat)", warnCount: user.count, maxWarn: STATE.maxWarn };
  }

  // Cek duplicate
  if (text && text.length > 10) {
    user.messages.push(text.toLowerCase());
    if (user.messages.length > 10) user.messages.shift();
    const dupCount = user.messages.filter(msg => msg === text.toLowerCase()).length;
    if (dupCount >= 3) {
      user.count++;
      if (user.count >= STATE.maxWarn) {
        return { isSpam: true, action: "block", reason: "Duplicate: pesan sama diulang " + dupCount + "x" };
      }
      return { isSpam: true, action: "warn", reason: "Pesan duplicate " + dupCount + "x", warnCount: user.count, maxWarn: STATE.maxWarn };
    }
  }

  return { isSpam: false };
}

export function isAntiSpamChatEnabled() { return STATE.enabled; }
export function resetUserWarn(jid) { userWarnings.delete(jid); }

const pluginConfig = {
  name: "antispamchat",
  alias: ["antispamchat", "antispamdm", "antispamprivate"],
  category: "owner",
  description: "Anti spam di private chat — deteksi flood & duplicate dengan sistem warning",
  usage: ".antispamchat on/off | .antispamchat limit <n> | .antispamchat warn <n> | .antispamchat reset @user | .antispamchat status",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
