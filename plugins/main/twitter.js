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

const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `tw_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "🐦") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}twitter <link>*`,
          `◦ Contoh: *${prefix}twitter https://twitter.com/user/status/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { twitter } = await import("btch-downloader");
    const data = await twitter(url);

    if (!data?.status) throw new Error("Twitter API returned no data");

    if (data.HD || data.SD || data.video) {
      const videoUrl = data.HD || data.SD || data.video;
      const filePath = tempPath(".mp4");
      const res = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 60000 });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      await sock.sendMessage(m.chat, {
        video: fs.readFileSync(filePath),
        caption: `🐦 *Twitter/X Download*\n◦ Quality: *${data.HD ? "HD" : "SD"}*`,
        mimetype: "video/mp4",
      }, { quoted: m });

      try { fs.unlinkSync(filePath); } catch {}
    }

    if (data.audio) {
      const filePath = tempPath(".mp3");
      const res = await axios.get(data.audio, { responseType: "arraybuffer", timeout: 60000 });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      await sock.sendMessage(m.chat, {
        audio: fs.readFileSync(filePath),
        mimetype: "audio/mpeg",
        ptt: false,
      }, { quoted: m });

      try { fs.unlinkSync(filePath); } catch {}
    }

    const text =
      alyaHeader("Twitter", "🐦") +
      "\n\n" +
      bracketBox("🐦", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Link: *${url}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}twitter <link> untuk download video lain`);

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
  name: "twitter",
  alias: ["twitter", "twdl", "twvideo", "xdl"],
  category: "download",
  description: "Download video dari Twitter/X",
  usage: ".twitter <link>",
  example: ".twitter https://twitter.com/user/status/xxxx",
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
