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
  return path.join(TMP_DIR, `fotott_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const username = m.text?.trim();

    if (!username) {
      const text =
        alyaHeader("Cara Pakai", "🎵") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}fototiktok <username>*`,
          `◦ Contoh: *${prefix}fototiktok @username*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const apiUrl = `https://api.zeks.xyz/api/tiktokprofile?username=${encodeURIComponent(username)}`;
    const response = await axios.get(apiUrl, { timeout: 10000 });
    const data = response.data;
    const result = data?.result || data;
    const avatar = result?.avatar || result?.profile_picture || "";
    const bio = result?.bio || "Tidak ada bio";

    const text =
      alyaHeader("Foto TikTok", "🎵") +
      "\n\n" +
      bracketBox("🎵", "ʜᴀꜱɪʟ", [
        `◦ Username: *${username}*`,
        `◦ Bio: *${bio}*`,
        avatar ? `◦ Avatar: *${avatar}*` : "◦ Avatar: *Tidak ada*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}fototiktok <username> untuk cek profil lain`) +
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
  name: "fototiktok",
  alias: ["fototiktok", "ttp", "tiktokprofile", "fotott"],
  category: "search",
  description: "Lihat foto profil TikTok",
  usage: ".fototiktok <username>",
  example: ".fototiktok @username",
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
