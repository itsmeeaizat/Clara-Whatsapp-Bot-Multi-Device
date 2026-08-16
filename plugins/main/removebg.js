import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { pixa } from "../../src/scraper/removebackground.js";
import fs from "fs";

const pluginConfig = {
  name: "removebg",
  alias: ["removebg", "rmbg", "nobg"],
  category: "maker",
  description: "Hapus background gambar secara otomatis",
  usage: ".removebg",
  example: ".removebg (kirim gambar dengan caption .removebg)",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

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
        alyaHeader("Remove Background", "🪄") +
        "\n\n" +
        bracketBox("🪄", "ɪɴꜱᴛʀᴜᴋsɪ", [
          "◦ Kirim gambar + caption *.removebg*",
          "◦ Atau reply gambar dengan *.removebg*",
          "◦ Hanya mendukung gambar (JPG/PNG)",
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

    const tmpInput = `/tmp/removebg_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`;
    const tmpOutput = `/tmp/removebg_${Date.now()}_${Math.random().toString(16).slice(2)}.png`;

    fs.writeFileSync(tmpInput, buffer);

    const resultBuffer = await pixa(tmpInput);
    fs.writeFileSync(tmpOutput, resultBuffer);
    const finalBuffer = fs.readFileSync(tmpOutput);

    await sock.sendMessage(m.chat, {
      image: finalBuffer,
      caption: "Background berhasil dihapus",
    }, { quoted: m });

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

export default {
  config: pluginConfig,
  handler,
};
