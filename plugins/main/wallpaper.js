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
  return path.join(TMP_DIR, `wallpaper_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Cara Pakai", "🖼️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}wallpaper <query>*`,
          `◦ Contoh: *${prefix}wallpaper aesthetic*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const apiUrl = `https://api.zeks.xyz/api/wallpaper?q=${encodeURIComponent(query)}`;
    let imageUrl = null;
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.status && json.result?.image) {
        imageUrl = json.result.image;
      }
    } catch {}

    if (!imageUrl) {
      const text =
        alyaHeader("Wallpaper", "🖼️") +
        "\n\n" +
        bracketBox("🖼️", "ʜᴀꜱɪʟ", [
          `◦ Query: *${query}*`,
          "◦ Status: *Tidak ada wallpaper ditemukan*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}wallpaper <query> untuk mencari lagi`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    const imgRes = await fetch(imageUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
    const filePath = tempPath(ext);
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.chat, {
      image: fs.readFileSync(filePath),
      caption: `Wallpaper: ${query}`,
    });

    const text =
      alyaHeader("Wallpaper", "🖼️") +
      "\n\n" +
      bracketBox("🖼️", "ʜᴀꜱɪʟ", [
        `◦ Judul: *${query}*`,
        `◦ Source: *${imageUrl}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}wallpaper <query> untuk mencari lagi`) +
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
  name: "wallpaper",
  alias: ["wall", "wp", "wallpapersearch", "wallpapersearch"],
  category: "search",
  description: "Cari wallpaper HD",
  usage: ".wallpaper <query>",
  example: ".wallpaper aesthetic",
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
