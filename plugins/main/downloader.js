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
  return path.join(TMP_DIR, `dl_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

function detectPlatform(url) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/tiktok\.com/.test(url)) return "tiktok";
  if (/instagram\.com/.test(url)) return "instagram";
  return null;
}

function getModulePath(platform) {
  if (platform === "youtube") return "../../../src/scraper/youtube.js";
  if (platform === "tiktok") return "../../../src/scraper/tiktok.js";
  if (platform === "instagram") return "../../../src/scraper/instagram.js";
  return null;
}

async function resolveBuffer(result, platform) {
  if (!result) return null;

  const buffer = Buffer.isBuffer(result) ? result : Buffer.from(result.url || result.download || result);
  if (buffer && buffer.length) return buffer;

  if (platform === "youtube" && result.downloads && Array.isArray(result.downloads)) {
    const pick = result.downloads.find((item) => item.url) || result.downloads[0];
    if (pick?.url) {
      const response = await axios.get(pick.url, { responseType: "arraybuffer" });
      return Buffer.from(response.data);
    }
  }

  return null;
}

async function downloadMedia(sock, chat, url, platform, quoted) {
  const modulePath = getModulePath(platform);
  if (!modulePath) throw new Error("Scraper tidak ditemukan");

  const mod = await import(modulePath);
  const fn = mod.default || mod[Object.keys(mod)[0]];
  const result = await fn(url);
  const buffer = await resolveBuffer(result, platform);

  if (!buffer || buffer.length === 0) throw new Error("Media kosong");

  const ext = platform === "youtube" ? ".mp4" : ".jpg";
  const filePath = tempPath(ext);
  fs.writeFileSync(filePath, buffer);

  const isVideo = platform === "youtube" || platform === "tiktok";
  const mediaKey = isVideo ? "video" : "image";

  await sock.sendMessage(chat, {
    [mediaKey]: fs.readFileSync(filePath),
    caption: `*Download Selesai*\n◦ Platform: *${platform.toUpperCase()}*\n◦ URL: ${url}`,
  }, { quoted });
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = (m.text || "").trim().replace(new RegExp(`^\\.(dl|downloader|yt|tiktok|ig|youtube|tiktokdl|igdl)\\s*`, "i"), "").trim();

    const platform = detectPlatform(url);
    if (!platform) {
      const text =
        alyaHeader("Downloader", "⬇️") +
        "\n\n" +
        bracketBox("⬇️", "ɪɴꜱᴛʀᴜᴋsɪ", [
          "◦ YouTube: *.dl https://youtube.com/...*",
          "◦ TikTok: *.dl https://tiktok.com/...*",
          "◦ Instagram: *.dl https://instagram.com/...*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await downloadMedia(sock, m.chat, url, platform, m);
    return { handled: true };
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
    return { handled: true };
  }
}

const pluginConfig = {
  name: "downloader",
  alias: ["dl", "download", "yt", "tiktok", "ig", "youtube", "tiktokdl", "igdl"],
  category: "download",
  description: "Download video/audio dari YouTube, TikTok, Instagram",
  usage: ".dl <url>",
  example: ".dl https://youtube.com/...\n.dl https://tiktok.com/...\n.dl https://instagram.com/...",
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
