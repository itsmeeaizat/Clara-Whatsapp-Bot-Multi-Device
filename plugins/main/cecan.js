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
  return path.join(TMP_DIR, `cecan_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

const ENDPOINTS = [
  "https://api.zeks.xyz/api/cecan",
  "https://api.zeks.xyz/api/cecanindo",
];

const pluginConfig = {
  name: "cecan",
  alias: ["cecan", "cecanindo", "indoc", "cecanind"],
  category: "search",
  description: "Cari cecan Indonesia",
  usage: ".cecan",
  example: ".cecan",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    let buffer = null;
    let source = "";

    for (const baseUrl of ENDPOINTS) {
      try {
        const res = await axios.get(baseUrl, {
          responseType: "arraybuffer",
          timeout: 15000,
        });
        if (res.status === 200 && res.data && res.data.length > 1000) {
          buffer = Buffer.from(res.data);
          source = baseUrl;
          break;
        }
      } catch {}
    }

    if (!buffer) {
      const text =
        alyaHeader("Cecan", "🧑") +
        "\n\n" +
        bracketBox("🧑", "ʀᴇꜱᴜʟᴛ", [
          "◦ Status: *Gagal*",
          "◦ Alasan: *Endpoint cecan saat ini tidak merespons.*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const filePath = tempPath(".jpg");
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.chat, {
      image: fs.readFileSync(filePath),
      caption: "Cecan Indonesia 🧑",
    }, { quoted: m });

    const text =
      alyaHeader("Cecan", "🧑") +
      "\n\n" +
      bracketBox("🧑", "ʀᴇꜱᴜʟᴛ", [
        "◦ Sumber: *API*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}cecan untuk hasil lain`) +
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
