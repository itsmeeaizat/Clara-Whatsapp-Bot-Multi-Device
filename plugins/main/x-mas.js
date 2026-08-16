import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `xmas_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

const pluginConfig = {
  name: "x-mas",
  alias: ["xmas", "christmas", "natal", "xmasevent", "x-mas"],
  category: "info",
  description: "Fitur spesial Natal",
  usage: ".x-mas",
  example: ".x-mas",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const userName = m.pushName || "Kamu";
    const month = new Date().getMonth() + 1;
    const isChristmasSeason = month === 12;

    const text =
      alyaHeader("Christmas", "🎄") +
      "\n\n" +
      bracketBox("🎄", "ɴᴀᴛᴀʟ", [
        `◦ Hai *${userName}*!`,
        isChristmasSeason ? "◦ Musim Natal aktif! 🎅" : "◦ Khusus hari Natal!",
        "◦ Selamat Natal! 🎄",
        "◦ Damai dan bahagia selalu.",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}x-mas untuk ucapan Natal`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

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
