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
  return path.join(TMP_DIR, `aiimg_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const prompt = m.text?.trim();

    if (!prompt) {
      const text =
        alyaHeader("Cara Pakai", "🖌️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-image <prompt>*`,
          `◦ Contoh: *${prefix}ai-image cyberpunk city neon lights*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const endpoints = [
      `https://api.miaou.xyz/api/txt2img?prompt=${encodeURIComponent(prompt)}`,
      `https://api.zeks.xyz/api/txt2img?prompt=${encodeURIComponent(prompt)}`,
    ];

    let buffer = null;
    for (const apiUrl of endpoints) {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) continue;
        buffer = Buffer.from(await res.arrayBuffer());
        if (buffer && buffer.length > 1000) break;
      } catch {}
    }

    if (!buffer) throw new Error("Gagal generate gambar dari semua endpoint.");

    const filePath = tempPath(".png");
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.chat, {
      image: fs.readFileSync(filePath),
      caption: `AI Image: ${prompt.slice(0, 200)}`,
    }, { quoted: m });

    const text =
      alyaHeader("AI Image", "🖌️") +
      "\n\n" +
      bracketBox("🖌️", "ɢᴇɴᴇʀᴀᴛᴇ", [
        `◦ Prompt: *${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai-image <prompt> untuk gambar lain`) +
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
  name: "ai-image",
  alias: ["ai-image", "aiimg", "generateimg", "draw", "imagegen", "imgai"],
  category: "ai",
  description: "Generate gambar dari teks",
  usage: ".ai-image <prompt>",
  example: ".ai-image sunset over mountains",
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
