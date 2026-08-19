// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { sendStickerFromMedia } from "../../src/lib/clara-sticker-util.js";

const pluginConfig = {
  name: "sticker",
  alias: ["stiker", "s", "stick", "stik"],
  category: "sticker",
  description: "Buat sticker dari gambar/video",
  usage: ".sticker",
  example: ".sticker (kirim gambar/video dengan caption .sticker)",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function extractMedia(m) {
  const quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const msg = quoted || m.message;

  const img = msg?.imageMessage || msg?.videoMessage;
  if (!img) return null;

  const mime = img.mimetype || "";
  if (!mime.startsWith("image") && !mime.startsWith("video")) return null;

  return {
    buffer: Buffer.isBuffer(img) ? img : Buffer.from(img ?? ""),
    mime,
  };
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const media = extractMedia(m);
    if (!media) {
      const text =
        alyaHeader("Sticker", "🖼️") +
        "\n\n" +
        bracketBox("🖼️", "ɪɴꜱᴛʀᴜᴋsɪ", [
          "◦ Cara 1: *Kirim gambar/video + caption .sticker*",
          "◦ Cara 2: *Reply gambar/video dengan .sticker*",
          "◦ Format: *PNG, WEBP, GIF, Video pendek*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sendStickerFromMedia(sock, m, media.buffer, media.mime);
    return { handled: true };
  } catch (error) {
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

export default {
  config: pluginConfig,
  handler,
};
