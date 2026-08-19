// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `ppcouple_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const db = getDatabase();
    const couple = db?.getCouple?.(m.sender) || null;

    if (!couple) {
      const text =
        alyaHeader("PP Couple", "💑") +
        "\n\n" +
        bracketBox("💔", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Kamu belum memiliki pasangan!",
          "",
          `◦ Coba: *${prefix}marry @member*`,
          `◦ Atau: *${prefix}couple*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("PP Couple", "💑") +
      "\n\n" +
      bracketBox("💑", "ʜᴜʙᴜɴɢᴀɴ", [
        `◦ Kamu: *${m.pushName || "Player"}*`,
        `◦ Pasangan: *${couple.partner || "Unknown"}*`,
        "◦ Status: *Married*",
      ]) +
      "\n\n" +
      separator() +
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

const pluginConfig = {
  name: "ppcouple",
  alias: ["ppcouple", "couplepp", "pppasangan", "lovepp"],
  category: "game",
  description: "Lihat PP/status pasangan",
  usage: ".ppcouple",
  example: ".ppcouple",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

export default {
  config: pluginConfig,
  handler,
};
