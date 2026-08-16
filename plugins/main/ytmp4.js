import fs from "fs";
import path from "path";
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const TMP_DIR = path.join(process.cwd(), "tmp");
function ensureTmp() { if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true }); }
function tempPath(ext) { ensureTmp(); return path.join(TMP_DIR, `ytmp4_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`); }

const pluginConfig = {
  name: "ytmp4",
  alias: ["ytmp4", "ytvideo", "ytv", "ytmp4dl"],
  category: "download",
  description: "Download video MP4 dari YouTube",
  usage: ".ytmp4 <link YouTube>",
  example: ".ytmp4 https://youtube.com/watch?v=xxxx",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 15, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();
    if (!url) {
      const text = alyaHeader("Cara Pakai", "🎬") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}ytmp4 <link>*`,
        `◦ Contoh: *${prefix}ytmp4 https://youtube.com/watch?v=xxxx*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const { youtube } = await import("btch-downloader");
    const data = await youtube(url);
    if (!data?.status) throw new Error("Gagal download video");

    const videoUrl = data.mp4;
    if (!videoUrl) throw new Error("No video URL");

    const filePath = tempPath(".mp4");
    const res = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 120000 });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await sock.sendMessage(m.chat, {
      video: fs.readFileSync(filePath),
      caption: `🎬 *YouTube MP4*\n◦ Judul: *${data.title || "-"}*`,
      mimetype: "video/mp4",
    }, { quoted: m });
    try { fs.unlinkSync(filePath); } catch {}

    const text = alyaHeader("YouTube MP4", "🎬") + "\n\n" + bracketBox("🎬", "ᴅᴏᴡɴʟᴏᴀᴅ", [
      `◦ Judul: *${data.title || "-"}*`,
      `◦ Channel: *${data.author || "-"}*`,
      "◦ Status: *Berhasil*",
    ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}ytmp4 <link> untuk video lain`);
    await m.reply(text);
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
