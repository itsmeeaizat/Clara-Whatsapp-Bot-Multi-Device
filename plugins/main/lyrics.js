import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "lyrics",
  alias: ["lyrics", "lirik", "lyric", "liriklagu"],
  category: "music",
  description: "Cari lirik lagu",
  usage: ".lyrics <artist> <judul>",
  example: ".lyrics adele hello",
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
    const text = m.text?.trim();

    if (!text) {
      const reply =
        alyaHeader("Cara Pakai", "🎵") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}lyrics <artist> <judul>*`,
          `◦ Contoh: *${prefix}lyrics adele hello*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    // Parse "artist title" or "artist - title"
    const parts = text.includes(" - ") ? text.split(" - ") : text.split(" ");
    const artist = parts[0]?.trim();
    const title = parts.slice(1).join(" ").trim();

    if (!artist || !title) {
      throw new Error("Format: .lyrics <artist> <judul>");
    }

    const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 10000 });

    const lyrics = res.data?.lyrics;
    if (!lyrics) throw new Error("Lirik tidak ditemukan");

    // Truncate if too long
    const maxLen = 1500;
    const truncated = lyrics.length > maxLen
      ? lyrics.substring(0, maxLen) + "..."
      : lyrics;

    const reply =
      alyaHeader("Lyrics", "🎵") +
      "\n\n" +
      bracketBox("🎵", "ʟɪʀɪᴋ ʟᴀɢᴜ", [
        `◦ Artist: *${artist}*`,
        `◦ Title: *${title}*`,
      ]) +
      "\n\n" +
      truncated +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}lyrics <artist> <judul> untuk lirik lain`);

    await m.reply(reply);
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
