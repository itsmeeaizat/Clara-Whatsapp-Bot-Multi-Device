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
  return path.join(TMP_DIR, `spotify_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const input = m.text?.trim();

    if (!input) {
      const text =
        alyaHeader("Cara Pakai", "🟢") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}spotify <link/lagu>*`,
          `◦ Contoh: *${prefix}spotify https://open.spotify.com/track/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const apiUrl = `https://api.zeks.xyz/api/spotify?q=${encodeURIComponent(input)}`;
    const response = await axios.get(apiUrl, { timeout: 10000 });
    const data = response.data;
    const result = data?.result || data;
    const title = result?.title || result?.name || input;
    const artist = result?.artist || result?.artists || "Unknown";
    const url = result?.url || result?.link || input;

    const text =
      alyaHeader("Spotify", "🟢") +
      "\n\n" +
      bracketBox("🟢", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Judul: *${title}*`,
        `◦ Artis: *${artist}*`,
        `◦ Link: *${url}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}spotify <link> untuk download lagu lain`) +
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
  name: "spotify",
  alias: ["spotify", "spotifydl", "spotifydownloader"],
  category: "music",
  description: "Cari/download lagu Spotify",
  usage: ".spotify <link/lagu>",
  example: ".spotify https://open.spotify.com/track/xxxx",
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
