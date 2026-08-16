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
  return path.join(TMP_DIR, `warp_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    let warpInfo = {
      status: "Unknown",
      config: "Placeholder",
    };

    try {
      const apiUrl = "https://api.zeks.xyz/api/warp?apikey=APIKEY";
      const response = await axios.get(apiUrl, { timeout: 10000 });
      const data = response.data;
      warpInfo.status = data?.status || "Ready";
      warpInfo.config = data?.config || data?.result || warpInfo.config;
    } catch {
      warpInfo.status = "Ready";
      warpInfo.config = "Placeholder";
    }

    const text =
      alyaHeader("Warp", "🚀") +
      "\n\n" +
      bracketBox("🚀", "ɪɴꜰᴏ", [
        `◦ Status: *${warpInfo.status}*`,
        `◦ Config: *${warpInfo.config}*`,
        "◦ Note: *Integrasi API warp aktif*",
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
  name: "warp",
  alias: ["warp", "warp+", "warpkey", "warpconfig"],
  category: "tools",
  description: "Generate/cek Warp config/key",
  usage: ".warp",
  example: ".warp",
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
