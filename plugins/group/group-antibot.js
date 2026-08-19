/**
 * Anti Bot WA — Deteksi & kick bot WhatsApp lain di grup ini
 * .antibot on/off — Toggle (admin grup)
 * .antibot mode kick/warn — Set action: kick atau warn (default: warn)
 * .antibot whitelist @bot — Whitelist bot tertentu (gak akan dikick)
 * .antibot unwhitelist @bot — Hapus dari whitelist
 * .antibot status — Cek status
 *
 * Deteksi bot lain berdasarkan:
 * - Pesan dengan prefix command (. / ! # $)
 * - Pola menu/list bot
 * - Sticker bot watermark
 * - Nomor dari database bot known
 */
import config from "../../config.js";
import { getDatabase } from "../../src/lib/clara-database.js";

// Known bot numbers (database - bisa diupdate)
const KNOWN_BOTS = new Set();

// Bot command patterns
const BOT_PATTERNS = [
  /^(\.|\/|!|#|\$)\w+/i,           // Command prefix
  /menu|help|fitur|command/i,       // Menu keywords
  /bot\s+(aktif|on|off|status)/i,  // Bot status
];

// Bot response patterns (pesan yang biasa dikirim bot)
const BOT_RESPONSE_PATTERNS = [
  /─{5,}|═{5,}|━{5,}/,           // Decorative lines
  /「.*」/,                       // Japanese brackets
  /╭.*╮|╔.*╗/,                   // Box drawing
  /balance|limit|energi|exp/i,    // RPG terms in structured format
];

const groupStates = new Map();

function getGroupState(jid) {
  if (!groupStates.has(jid)) {
    groupStates.set(jid, { enabled: true, mode: "warn", blocked: 0, kicked: 0, whitelist: new Set() });
  }
  return groupStates.get(jid);
}

function detectBotMessage(text, sender) {
  if (!text) return { isBot: false };

  // Cek whitelist
  const num = sender?.split("@")[0];
  if (KNOWN_BOTS.has(num)) return { isBot: true, reason: "Known bot number" };

  // Cek command prefix (tapi bukan dari admin/owner)
  let botScore = 0;
  let reasons = [];

  // Pattern 1: Command prefix
  if (BOT_PATTERNS[0].test(text)) {
    botScore += 2;
    reasons.push("Menggunakan command prefix");
  }

  // Pattern 2: Menu keywords
  if (BOT_PATTERNS[1].test(text) && text.length > 50) {
    botScore += 2;
    reasons.push("Mengandung keyword menu/bot");
  }

  // Pattern 3: Decorative formatting (bot-like)
  if (BOT_RESPONSE_PATTERNS[0].test(text)) {
    botScore += 3;
    reasons.push("Formatting decorative (khas bot)");
  }

  // Pattern 4: Box drawing
  if (BOT_RESPONSE_PATTERNS[1].test(text)) {
    botScore += 2;
    reasons.push("Box drawing characters");
  }

  // Pattern 5: Japanese brackets
  if (BOT_RESPONSE_PATTERNS[2].test(text)) {
    botScore += 2;
    reasons.push("Japanese bracket formatting");
  }

  // Pattern 6: Multiple structured fields
  if ((text.match(/◦|•|▸|○|=>|::/g) || []).length > 5) {
    botScore += 2;
    reasons.push("Structured list formatting");
  }

  // Pattern 7: Emoji + structured text (bot-like)
  const emojiCount = (text.match(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 5 && text.length > 100) {
    botScore += 1;
    reasons.push("Excessive emoji + long text");
  }

  if (botScore >= 4) {
    return { isBot: true, reason: reasons.join(", "), score: botScore };
  }

  return { isBot: false };
}

async function handler(m, { sock, db, groupMetadata }) {
  const command = m.command;
  const args = (m.text || "").toLowerCase().trim();
  const isGroup = m.chat?.endsWith("@g.us");

  if (command === "antibot") {
    if (!isGroup) return m.reply("Hanya untuk grup!");

    const meta = groupMetadata || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return m.reply("Gagal mendapatkan info grup.");
    const isAdmin = meta.participants?.some(p => p.id === m.sender && (p.admin === "admin" || p.admin === "superadmin"));
    const isOwner = config.owner?.numbers?.some(n => m.sender === n + "@s.whatsapp.net") || false;
    if (!isAdmin && !isOwner) return m.reply("Admin/Owner only!");

    const state = getGroupState(m.chat);
    const sub = args.split(" ")[0];
    const val = args.split(" ")[1];

    if (sub === "on" || sub === "enable") {
      state.enabled = true;
      const dbInst = getDatabase();
      if (dbInst?.setGroup) dbInst.setGroup(m.chat, { antibot: true });
      return m.reply("Anti Bot aktif! Bot lain akan " + (state.mode === "kick" ? "dikick" : "diwarn") + " otomatis.");
    }
    if (sub === "off" || sub === "disable") {
      state.enabled = false;
      const dbInst = getDatabase();
      if (dbInst?.setGroup) dbInst.setGroup(m.chat, { antibot: false });
      return m.reply("Anti Bot dinonaktifkan.");
    }
    if (sub === "mode") {
      if (val !== "kick" && val !== "warn") return m.reply("Format: .antibot mode <kick|warn>\nContoh: .antibot mode kick");
      state.mode = val;
      return m.reply("Mode Anti Bot: " + val.toUpperCase() + (val === "kick" ? " — Bot akan dikick!" : " — Bot akan diwarn dulu."));
    }
    if (sub === "whitelist") {
      const target = m.mentionedJid?.[0];
      if (!target) return m.reply("Tag bot yang mau di-whitelist.\nContoh: .antibot whitelist @bot");
      state.whitelist.add(target);
      return m.reply("@" + target.split("@")[0] + " di-whitelist (gak akan dikick/warn).", { mentions: [target] });
    }
    if (sub === "unwhitelist") {
      const target = m.mentionedJid?.[0];
      if (!target) return m.reply("Tag bot yang mau dihapus.\nContoh: .antibot unwhitelist @bot");
      state.whitelist.delete(target);
      return m.reply("@" + target.split("@")[0] + " dihapus dari whitelist.", { mentions: [target] });
    }
    if (sub === "status") {
      return m.reply(
        "Anti Bot: " + (state.enabled ? "ON" : "OFF") +
        "\nMode: " + state.mode.toUpperCase() +
        "\nWarned: " + state.blocked + " bot" +
        "\nKicked: " + state.kicked + " bot" +
        "\nWhitelist: " + state.whitelist.size + " bot"
      );
    }

    return m.reply(
      "Anti Bot: " + (state.enabled ? "ON" : "OFF") + "\n\n" +
      ".antibot on/off — Toggle\n" +
      ".antibot mode <kick|warn> — Set action\n" +
      ".antibot whitelist @bot — Whitelist bot\n" +
      ".antibot unwhitelist @bot — Hapus whitelist\n" +
      ".antibot status — Cek status"
    );
  }

  return { handled: false };
}

// Export untuk message handler
export function checkBot(text, sender, jid) {
  const state = groupStates.get(jid);
  if (!state || !state.enabled) return { isBot: false };
  if (state.whitelist.has(sender)) return { isBot: false };

  const result = detectBotMessage(text, sender);
  if (result.isBot) {
    return { isBot: true, action: state.mode, reason: result.reason, score: result.score };
  }
  return { isBot: false };
}

export function markBotAction(jid, action) {
  const state = getGroupState(jid);
  if (action === "kick") state.kicked++;
  else state.blocked++;
}

export function isAntiBotEnabled(jid) {
  const state = groupStates.get(jid);
  return state ? state.enabled : false;
}

// Add known bot number
export function addKnownBot(number) {
  KNOWN_BOTS.add(number);
}

const pluginConfig = {
  name: "antibot",
  alias: ["antibot", "antibotwa", "antibotwa"],
  category: "group",
  description: "Anti bot WhatsApp — deteksi & kick/warn bot lain di grup dengan whitelist",
  usage: ".antibot on/off | .antibot mode <kick|warn> | .antibot whitelist @bot | .antibot status",
  isOwner: false,
  isGroup: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
