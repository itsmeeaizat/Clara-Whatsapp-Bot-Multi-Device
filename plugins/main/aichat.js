// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDatabase } from "../../src/lib/clara-database.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAI } from "../../src/lib/clara-ai-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function getHistoryKey(chatId) {
  return `ai_chat_history_${chatId}`;
}

function getHistory(chatId) {
  try {
    const db = getDatabase();
    const data = db.get(chatId);
    return Array.isArray(data?.aiChatHistory) ? data.aiChatHistory : [];
  } catch {
    return [];
  }
}

function appendHistory(chatId, role, content) {
  try {
    const db = getDatabase();
    const current = db.get(chatId) || {};
    const history = Array.isArray(current.aiChatHistory) ? current.aiChatHistory : [];
    history.push({ role, content, time: Date.now() });
    if (history.length > 50) history.splice(0, history.length - 50);
    current.aiChatHistory = history;
    db.set(chatId, current);
  } catch {}
}

const pluginConfig = {
  name: "aichat",
  alias: ["aichat", "chatai", "aiconvo", "aitalk", "aichathistory"],
  category: "ai",
  description: "Chat AI dengan memori percakapan per chat",
  usage: ".aichat <pesan> | .aichat clear",
  example: ".aichat Jelaskan量子 computing",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = m.text?.trim() || "";
    const chatId = m.chat;

    if (raw.toLowerCase() === `${prefix}aichat clear` || raw.toLowerCase() === `${prefix}aichat reset`) {
      try {
        const db = getDatabase();
        const current = db.get(chatId) || {};
        current.aiChatHistory = [];
        db.set(chatId, current);
      } catch {}

      const text =
        alyaHeader("AI Chat", "🧹") +
        "\n\n" +
        bracketBox("🧹", "ʜɪꜱᴛᴏʀʏ", [
          "◦ Status: *Dihapus*",
          "◦ Memori percakapan sudah direset.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}aichat <pesan> untuk mulai lagi`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    const message = raw.replace(/^\.aichat\s+/i, "").trim();
    if (!message) {
      const text =
        alyaHeader("Cara Pakai", "💬") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}aichat <pesan>*`,
          `◦ Reset: *${prefix}aichat clear*`,
          `◦ Contoh: *${prefix}aichat halo*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const history = getHistory(chatId);
    appendHistory(chatId, "user", message);

    const aiConfig = botConfig.aiHelp || {};
    const systemPrompt = String(aiConfig.systemPrompt || "Kamu adalah asisten AI yang ramah dan jelas.");

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20).map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: message },
    ];

    const reply = await callAI({
      providerKey: "openai",
      model: "gpt-4o-mini",
      messages,
      apiKey: aiConfig.apiKey,
      apiEndpoint: aiConfig.apiEndpoint,
    });

    appendHistory(chatId, "assistant", reply);

    const text =
      alyaHeader("AI Chat", "💬") +
      "\n\n" +
      bracketBox("💬", "ᴄʜᴀᴛ", [
        `◦ Kamu: *${message.slice(0, 200)}${message.length > 200 ? "..." : ""}*`,
        `◦ AI: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}aichat <pesan> untuk lanjut chat`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        `◦ Status: *Gagal*`,
        `◦ Alasan: *${error.message}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
