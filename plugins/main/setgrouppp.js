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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `grouppp_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

function extractImage(m) {
  const quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const msg = quoted || m.message;
  const img = msg?.imageMessage;
  if (!img) return null;
  const mime = img.mimetype || "";
  if (!mime.startsWith("image")) return null;
  return { mediaMessage: img, mime };
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const media = extractImage(m);
    if (!media) {
      const text =
        alyaHeader("Set Group PP", "👥") +
        "\n\n" +
        bracketBox("👥", "ɪɴꜱᴛʀᴜᴋsɪ", [
          "◦ Cara 1: *Kirim gambar + caption .setgrouppp*",
          "◦ Cara 2: *Reply gambar dengan .setgrouppp*",
          "◦ Format: *JPG, PNG, WEBP*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const buffer = await sock.downloadMediaMessage(media.mediaMessage);
    if (!buffer || buffer.length === 0) {
      throw new Error("Gagal mengunduh gambar");
    }

    await sock.updateGroupPicture(m.chat, buffer);

    const text =
      alyaHeader("Set Group PP", "👥") +
      "\n\n" +
      bracketBox("👥", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Group: *${m.chat}*`,
        "◦ Status: *SUCCESS*",
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
  name: "setgrouppp",
  alias: ["setgrouppp", "gantippgrup", "grouppp", "setgpp"],
  category: "group",
  description: "Ganti foto profil grup",
  usage: ".setgrouppp",
  example: ".setgrouppp (kirim gambar dengan caption .setgrouppp)",
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
