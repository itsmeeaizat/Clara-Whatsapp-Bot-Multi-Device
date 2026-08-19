// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
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

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `videy_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
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
          `◦ Penggunaan: *${prefix}videy <link>*`,
          `◦ Contoh: *${prefix}videy https://videy.co/video/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    // Try internal scraper first
    try {
      const videy = (await import("../../src/scraper/videy.js")).default;
      const data = await videy(url);
      if (data?.url || data?.link) {
        const videoUrl = data.url || data.link;
        const filePath = tempPath(".mp4");
        const res = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 60000 });
        fs.writeFileSync(filePath, Buffer.from(res.data));

        await sock.sendMessage(m.chat, {
          video: fs.readFileSync(filePath),
          caption: `🎬 *Videy Download*\n◦ Status: *Berhasil*`,
          mimetype: "video/mp4",
        }, { quoted: m });

        try { fs.unlinkSync(filePath); } catch {}
        return { handled: true };
      }
    } catch {}

    // Fallback: direct download attempt
    const filePath = tempPath(".mp4");
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000, maxRedirects: 5 });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await sock.sendMessage(m.chat, {
      video: fs.readFileSync(filePath),
      caption: `🎬 *Videy Download*\n◦ Status: *Berhasil*`,
      mimetype: "video/mp4",
    }, { quoted: m });

    try { fs.unlinkSync(filePath); } catch {}

    const text =
      alyaHeader("Videy", "🎬") +
      "\n\n" +
      bracketBox("🎬", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Link: *${url}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}videy <link> untuk download video lain`);

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
  name: "videy",
  alias: ["videydl", "vd"],
  category: "download",
  description: "Download video dari Videy",
  usage: ".videy <link>",
  example: ".videy https://videy.co/video/xxxx",
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
