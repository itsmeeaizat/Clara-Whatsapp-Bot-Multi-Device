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
  return path.join(TMP_DIR, `quote_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

const pluginConfig = {
  name: "quote",
  alias: ["quote", "quotes", "motivation", "quoterandom"],
  category: "fun",
  description: "Dapatkan quote motivasi acak",
  usage: ".quote",
  example: ".quote",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const LOCAL_QUOTES = [
  "Hidup itu seperti sepeda, agar tetap seimbang kamu harus terus bergerak.",
  "Jangan tunggu kesempatan, buatlah kesempatan itu sendiri.",
  "Kegagalan adalah kesempatan untuk mulai lagi dengan lebih bijak.",
];

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    let quote = null;
    let source = "";

    try {
      const res = await axios.get("https://api.zeks.xyz/api/quote", { timeout: 15000 });
      quote = res.data?.result || res.data?.quote || res.data?.message || null;
      source = "API";
    } catch {}

    if (!quote) quote = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
    if (!source) source = "Local";

    const text =
      alyaHeader("Quote", "✨") +
      "\n\n" +
      bracketBox("✨", "ǫᴜᴏᴛᴇ", [
        `◦ *${quote}*`,
        `◦ Sumber: *${source}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}quote untuk quote lain`) +
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
