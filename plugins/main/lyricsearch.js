// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "lyricsearch",
  alias: ["lyricsearch", "cari-lirik", "carilirik"],
  category: "music",
  description: "Cari lirik lagu (advanced)",
  usage: ".lyricsearch <artist - judul>",
  example: ".lyricsearch adele - hello",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const text = m.text?.trim();
    if (!text) {
      const reply = alyaHeader("Cara Pakai", "📝") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}lyricsearch <artist - judul>*`,
        `◦ Contoh: *${prefix}lyricsearch adele - hello*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(reply);
      return { handled: true };
    }

    const parts = text.split(" - ");
    const artist = parts[0]?.trim();
    const title = parts[1]?.trim() || parts[0]?.trim();

    if (!artist) throw new Error("Format: .lyricsearch <artist - judul>");

    const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 10000 });

    const lyrics = res.data?.lyrics;
    if (!lyrics) throw new Error("Lirik tidak ditemukan");

    const maxLen = 1500;
    const truncated = lyrics.length > maxLen ? lyrics.substring(0, maxLen) + "..." : lyrics;

    const reply = alyaHeader("Lyric Search", "📝") + "\n\n" +
      bracketBox("📝", "ʟɪʀɪᴋ", [
        `◦ Artist: *${artist}*`,
        `◦ Title: *${title}*`,
      ]) + "\n\n" + truncated + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}lyricsearch <artist - judul> untuk lirik lain`);

    await m.reply(reply);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text = alyaHeader("Gagal", "❌") + "\n\n" + bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`, `◦ Alasan: *${error.message}*`,
    ]) + "\n\n" + separator() + "\n" + tipText(`Coba lagi nanti`);
    await m.reply(text);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
