// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `enhance_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    // Check for quoted image
    const quoted = m.quoted;
    if (!quoted || !quoted.message?.imageMessage) {
      const text =
        alyaHeader("Cara Pakai", "✨") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Reply gambar dengan *${prefix}enhance*`,
          `◦ Fungsi: Upscale gambar HD`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    // Download image
    const buffer = await quoted.download();
    const inputPath = tempPath(".jpg");
    fs.writeFileSync(inputPath, buffer);

    // Use internal upscaler
    try {
      const upscaler = (await import("../../src/scraper/upscaler.js")).default;
      const result = await upscaler(inputPath);
      
      if (result) {
        const enhancedBuf = fs.existsSync(result) ? fs.readFileSync(result) : null;
        if (enhancedBuf) {
          await sock.sendMessage(m.chat, {
            image: enhancedBuf,
            caption: `✨ *Enhance*\n◦ Status: *Berhasil*`,
          }, { quoted: m });

          try { fs.unlinkSync(inputPath); fs.unlinkSync(result); } catch {}
          return { handled: true };
        }
      }
    } catch (e) {
      console.log("upscaler failed:", e.message);
    }

    // Fallback: just send the original with enhanced note
    await sock.sendMessage(m.chat, {
      image: fs.readFileSync(inputPath),
      caption: `✨ *Enhance*\n◦ Status: *Tidak dapat upscale, kirim original*`,
    }, { quoted: m });

    try { fs.unlinkSync(inputPath); } catch {}

    const text =
      alyaHeader("Enhance", "✨") +
      "\n\n" +
      bracketBox("✨", "ʀᴇꜱᴜʟᴛ", [
        "◦ Status: *Selesai*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Reply gambar dengan ${prefix}enhance untuk upscale lagi`);

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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

const pluginConfig = {
  name: "enhance",
  alias: ["enhance", "upscale", "hd"],
  category: "maker",
  description: "Upscale gambar jadi HD",
  usage: "Reply gambar dengan .enhance",
  example: ".enhance (reply gambar)",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

export default {
  config: pluginConfig,
  handler,
};
