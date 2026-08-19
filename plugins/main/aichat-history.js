// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "aichat-history",
  alias: ["aichat-history", "aichathistory", "aichatlogs", "historyai", "chatlogs"],
  category: "ai",
  description: "Lihat riwayat percakapan AI di chat ini",
  usage: ".aichat-history",
  example: ".aichat-history",
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
    const chatId = m.chat;
    const { getDatabase } = await import("../../src/lib/clara-database.js");
    const db = getDatabase();
    const data = db.get(chatId) || {};
    const history = Array.isArray(data.aiChatHistory) ? data.aiChatHistory.slice(-20) : [];

    if (!history.length) {
      const text =
        alyaHeader("AI History", "📜") +
        "\n\n" +
        bracketBox("📜", "ʜɪꜱᴛᴏʀʏ", [
          "◦ Status: *Kosong*",
          "◦ Belum ada percakapan AI di chat ini.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const lines = history.map((item, index) => {
      const role = item.role === "user" ? "Kamu" : "AI";
      const content = String(item.content || "").slice(0, 120);
      return `${index + 1}. *${role}*: ${content}${String(item.content || "").length > 120 ? "..." : ""}`;
    });

    const text =
      alyaHeader("AI History", "📜") +
      "\n\n" +
      bracketBox("📜", "ʀɪᴡᴀʏᴀᴛ", lines) +
      "\n\n" +
      separator() +
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
