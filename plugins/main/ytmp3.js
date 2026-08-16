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
function tempPath(ext) { ensureTmp(); return path.join(TMP_DIR, `ytmp3_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`); }

const pluginConfig = {
  name: "ytmp3",
  alias: ["ytmp3", "ytaudio", "yta", "ytmp3dl"],
  category: "music",
  description: "Download audio MP3 dari YouTube",
  usage: ".ytmp3 <link YouTube>",
  example: ".ytmp3 https://youtube.com/watch?v=xxxx",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 15, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();
    if (!url) {
      const text = alyaHeader("Cara Pakai", "🎵") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}ytmp3 <link>*`,
        `◦ Contoh: *${prefix}ytmp3 https://youtube.com/watch?v=xxxx*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const { youtube } = await import("btch-downloader");
    const data = await youtube(url);
    if (!data?.status) throw new Error("Gagal download audio");

    const audioUrl = data.mp3;
    if (!audioUrl) throw new Error("No audio URL");

    const filePath = tempPath(".mp3");
    const res = await axios.get(audioUrl, { responseType: "arraybuffer", timeout: 120000 });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await sock.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mpeg", ptt: false,
      fileName: `${data.title || "audio"}.mp3`,
    }, { quoted: m });
    try { fs.unlinkSync(filePath); } catch {}

    const text = alyaHeader("YouTube MP3", "🎵") + "\n\n" + bracketBox("🎵", "ᴅᴏᴡɴʟᴏᴀᴅ", [
      `◦ Judul: *${data.title || "-"}*`,
      `◦ Channel: *${data.author || "-"}*`,
      "◦ Status: *Berhasil*",
    ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}ytmp3 <link> untuk audio lain`);
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
