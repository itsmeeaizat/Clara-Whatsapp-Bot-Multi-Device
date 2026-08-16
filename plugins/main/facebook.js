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
  return path.join(TMP_DIR, `fb_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "📘") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}facebook <link>*`,
          `◦ Contoh: *${prefix}facebook https://facebook.com/video/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { fbdown } = await import("btch-downloader");
    const data = await fbdown(url);

    if (!data?.status) throw new Error("Facebook API returned no data");

    const videoUrl = data.HD || data.Normal_video || data.sd || null;
    if (!videoUrl) throw new Error("No video URL found");

    const filePath = tempPath(".mp4");
    const res = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 60000 });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await sock.sendMessage(m.chat, {
      video: fs.readFileSync(filePath),
      caption: `📘 *Facebook Download*\n◦ Status: *Berhasil*`,
      mimetype: "video/mp4",
    }, { quoted: m });

    try { fs.unlinkSync(filePath); } catch {}

    const text =
      alyaHeader("Facebook", "📘") +
      "\n\n" +
      bracketBox("📘", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Link: *${url}*`,
        `◦ Quality: *${data.HD ? "HD" : "SD"}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}facebook <link> untuk download video lain`);

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
  name: "facebook",
  alias: ["facebook", "fbdl", "facebookdownloader"],
  category: "download",
  description: "Download video dari Facebook",
  usage: ".facebook <link>",
  example: ".facebook https://facebook.com/video/xxxx",
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
