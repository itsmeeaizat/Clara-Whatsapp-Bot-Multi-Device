// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import ssyoutube from "../../src/scraper/youtube.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "youtube",
  alias: ["yt", "ytdl", "ytmp3", "ytmp4"],
  category: "download",
  description: "Download video/audio YouTube",
  usage: ".yt <link>",
  example: ".yt https://youtu.be/xxxx",
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
        alyaHeader("Cara Pakai", "📥") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}yt <link youtube>*`,
          `◦ Contoh: *${prefix}yt https://youtu.be/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const result = await ssyoutube.download(url);

    if (result.error) {
      const text =
        alyaHeader("Download", "❌") +
        "\n\n" +
        bracketBox("❌", "ɢᴀɢᴀʟ", [
          "◦ Status: *Gagal*",
          `◦ Alasan: *${result.error}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const meta = result.meta || {};
    const dl = result.downloads?.[0] || {};

    const text =
      alyaHeader("YouTube", "📥") +
      "\n\n" +
      bracketBox("📥", "ʜᴀꜱɪʟ", [
        `◦ Judul: *${meta.title || "Tidak diketahui"}*`,
        `◦ Durasi: *${meta.duration || "Tidak diketahui"}*`,
        `◦ Kualitas: *${dl.quality || "Tidak diketahui"}*`,
        `◦ Format: *${dl.format || "Tidak diketahui"}*`,
        `◦ Ukuran: *${dl.size || "Tidak diketahui"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        "◦ Status: *Error*",
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
