// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `play_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Cara Pakai", "🎶") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}play <judul lagu>*`,
          `◦ Contoh: *${prefix}play Lagu Favorit*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    // Search YouTube
    const yts = (await import("yt-search")).default;
    const searchResults = await yts(query);
    const video = searchResults.all?.[0];
    if (!video) throw new Error("Lagu tidak ditemukan");

    // Download audio using btch-downloader
    const { youtube } = await import("btch-downloader");
    const data = await youtube(video.url);

    if (!data?.status) throw new Error("Gagal download audio");

    const audioUrl = data.audio || data.mp3 || data.url;
    if (!audioUrl) throw new Error("No audio URL found");

    const filePath = tempPath(".mp3");
    const axios = (await import("axios")).default;
    const res = await axios.get(audioUrl, { responseType: "arraybuffer", timeout: 120000 });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await sock.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${video.title}.mp3`,
    }, { quoted: m });

    try { fs.unlinkSync(filePath); } catch {}

    const text =
      alyaHeader("Play", "🎶") +
      "\n\n" +
      bracketBox("🎶", "ᴘʟᴀʏʟɪꜱᴛ", [
        `◦ Judul: *${video.title}*`,
        `◦ Duration: *${video.timestamp || "-"}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}play <judul> untuk lagu lain`);

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

const pluginConfig = {
  name: "play",
  alias: ["play", "music", "song", "lagu"],
  category: "music",
  description: "Putar lagu dari YouTube",
  usage: ".play <judul lagu>",
  example: ".play Lagu Favorit",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

export default {
  config: pluginConfig,
  handler,
};
