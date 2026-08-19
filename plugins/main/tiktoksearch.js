// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tiktoksearch",
  alias: ["tiktoksearch", "ttsearch", "tiktoksrc"],
  category: "search",
  description: "Cari video TikTok berdasarkan query",
  usage: ".tiktoksearch <query>",
  example: ".tiktoksearch dance challenge",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Cara Pakai", "🔍") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}tiktoksearch <query>*`,
          `◦ Contoh: *${prefix}tiktoksearch dance challenge*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    // Try internal scraper
    try {
      const { tiktokSearchVideo } = await import("../../src/scraper/tiktoksearch.js");
      const results = await tiktokSearchVideo(query);

      if (results && results.length > 0) {
        const topResults = results.slice(0, 5);
        const list = topResults.map((v, i) =>
          `${i + 1}. *${v.title || v.desc || "No title"}*\n   ${v.url || v.link || ""}`
        ).join("\n\n");

        const text =
          alyaHeader("TikTok Search", "🔍") +
          "\n\n" +
          bracketBox("🔍", "ʜᴀꜱɪʟ", [
            `◦ Query: *${query}*`,
            `◦ Total: *${topResults.length} video*`,
          ]) +
          "\n\n" +
          list +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}tiktoksearch <query> untuk cari lagi`);

        await m.reply(text);
        return { handled: true };
      }
    } catch {}

    throw new Error("TikTok search sedang tidak tersedia, coba lagi nanti");
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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
