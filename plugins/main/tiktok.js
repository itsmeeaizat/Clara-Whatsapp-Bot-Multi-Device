// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import ttdown from "../../src/scraper/tiktok.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tiktok",
  alias: ["tt", "tiktokdl", "tiktokdownload"],
  category: "download",
  description: "Download video/audio TikTok",
  usage: ".tiktok <link>",
  example: ".tiktok https://tiktok.com/@user/video/xxxx",
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
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "🎵") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}tiktok <link tiktok>*`,
          `◦ Contoh: *${prefix}tiktok https://tiktok.com/@user/video/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const result = await ttdown(url);

    const text =
      alyaHeader("TikTok", "🎵") +
      "\n\n" +
      bracketBox("🎵", "ʜᴀꜱɪʟ", [
        `◦ Judul: *${result.title || "Tidak diketahui"}*`,
        `◦ Author: *@${result.author?.username || "tidak diketahui"}*`,
        `◦ Tipe: *${result.downloads?.[0]?.label || "Video"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}tiktok <link> untuk download video lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    await m.reply(text);
  } catch (error) {
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
