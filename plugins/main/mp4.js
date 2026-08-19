// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
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
  return path.join(TMP_DIR, `mp4_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "🎬") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}mp4 <link>*`,
          `◦ Contoh: *${prefix}mp4 https://example.com/video.mp4*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const response = await axios.get(url, { responseType: "arraybuffer", maxRedirects: 5 });
    const buffer = Buffer.from(response.data);
    const filePath = tempPath(".mp4");
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.chat, {
      video: fs.readFileSync(filePath),
      caption: `◦ URL: *${url}*\n◦ Ukuran: *${(buffer.length / 1024 / 1024).toFixed(2)} MB*`,
    }, { quoted: m });

    const text =
      alyaHeader("MP4 Download", "🎬") +
      "\n\n" +
      bracketBox("🎬", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Link: *${url}*`,
        "◦ Status: *Berhasil*",
      ]) +
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

const pluginConfig = {
  name: "mp4",
  alias: ["mp4", "videomp4", "downloadmp4"],
  category: "download",
  description: "Download file MP4 dari link",
  usage: ".mp4 <link>",
  example: ".mp4 https://example.com/video.mp4",
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
