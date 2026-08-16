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
  return path.join(TMP_DIR, `enhance_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const media = m.msg?.imageMessage || m.msg?.videoMessage || m.quoted?.msg?.imageMessage || m.quoted?.msg?.videoMessage;
    if (!media) {
      const text =
        alyaHeader("Cara Pakai", "✨") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}enhance*`,
          `◦ Kirim/reply foto/video, lalu ketik *${prefix}enhance*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const buffer = await sock.downloadMediaMessage(m.quoted || m);
    const ext = m.msg?.videoMessage || media?.videoMessage ? ".mp4" : ".png";
    const filePath = tempPath(ext);
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const apiUrl = `https://api.zeks.xyz/api/enhance`;
    const form = new FormData();
    form.append("file", Buffer.from(buffer), `media${ext}`);

    const response = await axios.post(apiUrl, form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
      timeout: 10000,
    });

    const resultBuffer = Buffer.from(response.data);
    const resultExt = ext;
    const resultPath = tempPath(resultExt);
    fs.writeFileSync(resultPath, resultBuffer);

    const caption =
      alyaHeader("Enhance", "✨") +
      "\n\n" +
      bracketBox("✨", "ʜᴀꜱɪʟ", [
        "◦ Status: *Berhasil*",
        "◦ Model: *AI Enhancement*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}enhance untuk enhance media lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    if (resultExt === ".mp4") {
      await sock.sendMessage(m.chat, {
        video: fs.readFileSync(resultPath),
        caption,
      }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, {
        image: fs.readFileSync(resultPath),
        caption,
      }, { quoted: m });
    }
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
  name: "enhance",
  alias: ["enhance", "upgradeimg", "perbaikiimg", "hd"],
  category: "ai",
  description: "Enhance kualitas foto/video",
  usage: ".enhance (reply media)",
  example: ".enhance (reply foto)",
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
