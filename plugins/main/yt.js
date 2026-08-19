// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import ssyoutube from "../../src/scraper/youtube.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `yt_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "▶️") +
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
    const downloads = result.downloads || [];
    const video = downloads.find((item) => !item.audio) || downloads[0];

    if (!video?.url) {
      const text =
        alyaHeader("Download", "❌") +
        "\n\n" +
        bracketBox("❌", "ɢᴀɢᴀʟ", [
          "◦ Status: *Link download tidak ditemukan*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const response = await axios.get(video.url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    if (!buffer || buffer.length === 0) {
      const text =
        alyaHeader("Download", "❌") +
        "\n\n" +
        bracketBox("❌", "ɢᴀɢᴀʟ", [
          "◦ Status: *Media kosong*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const filePath = tempPath(".mp4");
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.chat, {
      video: fs.readFileSync(filePath),
      caption: `*${meta.title || "YouTube Video"}*\n◦ Durasi: *${meta.duration || "Unknown"}*\n◦ Kualitas: *${video.quality || "Unknown"}*\n◦ Format: *${video.format || "mp4"}*\n◦ Ukuran: *${video.size || "Unknown"}*`,
    }, { quoted: m });

    return { handled: true };
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
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
    return { handled: true };
  }
}

const pluginConfig = {
  name: "yt",
  alias: ["ytdl", "ytmp3", "ytmp4"],
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

export default {
  config: pluginConfig,
  handler,
};
