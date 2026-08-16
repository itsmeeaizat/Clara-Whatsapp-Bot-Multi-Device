import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
  return path.join(TMP_DIR, `txt2img_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

const pluginConfig = {
  name: "txt2img",
  alias: ["texttoimage", "generateimage", "aiimage"],
  category: "maker",
  description: "Generate gambar dari teks menggunakan AI",
  usage: ".txt2img <prompt>",
  example: ".txt2img cyberpunk city neon lights",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const prompt = m.text?.trim();

    if (!prompt) {
      const text =
        alyaHeader("Cara Pakai", "🖌️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}txt2img <prompt>*`,
          `◦ Contoh: *${prefix}txt2img cyberpunk city neon lights*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const apiUrl = `https://api.miaou.xyz/api/txt2img?prompt=${encodeURIComponent(prompt)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Gagal generate gambar");

    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = tempPath(".png");
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.chat, {
      image: fs.readFileSync(filePath),
      caption: `Text to Image: ${prompt.slice(0, 200)}`,
    });

    const text =
      alyaHeader("Text to Image", "🖌️") +
      "\n\n" +
      bracketBox("🖌️", "ʜᴀꜱɪʟ", [
        `◦ Prompt: *${prompt.slice(0, 50)}${prompt.length > 50 ? "..." : ""}*`,
        "◦ Model: *AI Image Generator*",
        "◦ Resolution: *1024x1024*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}txt2img <prompt> untuk generate gambar lain`) +
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

export default {
  config: pluginConfig,
  handler,
};
