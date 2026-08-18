/**
 * AI Remini — Image Enhancer
 * ---------------------------------------------------------------
 * Recode bersih dari plugin ai-remini.js (Zeltoria/Clara-MD) yang
 * di-obfuscate. Menggunakan API inferenceengine.vyro.ai.
 *
 * Fitur:
 *  - .remini / .enhance / .tohd → enhance kualitas gambar
 *  - .recolor → koreksi warna gambar
 *  - .hdr → HDR effect pada gambar
 *
 * Cara pakai: reply gambar dengan command, atau kirim gambar + caption command.
 */

import axios from "axios";
import FormData from "form-data";

// Track active processes per sender (anti-spam)
const activeProcesses = new Map();

const VYRO_ENDPOINT = "https://inferenceengine.vyro.ai";

const pluginConfig = {
  name: "remini",
  alias: ["remini", "enhance", "tohd", "recolor", "hdr"],
  category: "ai",
  description: "Enhance kualitas gambar (Remini), recolor, atau HDR effect. Reply gambar dengan command.",
  usage: ".remini (reply gambar)",
  example: ".remini",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

/**
 * Proses gambar via vyro.ai API
 * @param {Buffer} imageBuffer - Buffer gambar yang akan diproses
 * @param {string} mode - "enhance" | "recolor" | "hdr"
 * @returns {Promise<Buffer>} - Buffer gambar hasil
 */
async function processImage(imageBuffer, mode) {
  const validModes = ["enhance", "recolor", "hdr"];
  const selectedMode = validModes.includes(mode) ? mode : "enhance";

  const formData = new FormData();
  formData.append("model_version", "1", {
    contentType: "multipart/form-data; charset=utf-8",
    filename: "enhance_image_body.jpg",
  });
  formData.append("image", Buffer.from(imageBuffer), {
    filename: "enhance_image_body.jpg",
    contentType: "image/jpeg",
  });

  const url = `${VYRO_ENDPOINT}/${selectedMode}`;

  const response = await axios.post(url, formData, {
    headers: {
      ...formData.getHeaders(),
      "User-Agent": "okhttp/4.9.3",
      Connection: "Keep-Alive",
      "Accept-Encoding": "gzip",
    },
    responseType: "arraybuffer",
    timeout: 60000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return Buffer.from(response.data);
}

async function handler(m, { sock, config }) {
  const sender = m.sender;
  const command = m.command || "";

  // Anti-spam: cek apakah user masih punya proses berjalan
  if (activeProcesses.has(sender)) {
    await m.reply("⏳ Masih ada proses yang belum selesai, tunggu dulu ya!");
    return { handled: true };
  }

  // Ambil gambar dari reply atau dari pesan itu sendiri
  const quoted = m.quoted || m;
  const mimeType = quoted?.mimetype || quoted?.message?.imageMessage?.mimetype || "";

  if (!mimeType) {
    await m.reply("❌ Fotonya mana? Reply/kirim gambar dengan command ini!");
    return { handled: true };
  }

  if (!/image\/(jpe?g|png)/.test(mimeType)) {
    await m.reply(`❌ Mime ${mimeType} tidak support! Hanya JPEG/PNG.`);
    return { handled: true };
  }

  // Lock proses
  activeProcesses.set(sender, true);

  try {
    await m.reply("🔄 Proses Kak...");

    // Download gambar
    let imageBuffer;
    if (m.quoted) {
      imageBuffer = await sock.downloadMediaMessage(m.quoted);
    } else {
      imageBuffer = await sock.downloadMediaMessage(m);
    }

    if (!imageBuffer) {
      await m.reply("❌ Gagal mengunduh gambar!");
      return { handled: true };
    }

    // Map command ke mode
    const modeMap = {
      remini: "enhance",
      enhance: "enhance",
      tohd: "enhance",
      recolor: "recolor",
      hdr: "hdr",
    };
    const mode = modeMap[command] || "enhance";

    // Proses gambar
    const resultBuffer = await processImage(imageBuffer, mode);

    if (!resultBuffer || resultBuffer.length < 100) {
      await m.reply("❌ Proses gagal! Gambar tidak bisa di-enhance.");
      return { handled: true };
    }

    // Kirim hasil
    const labels = {
      enhance: "✅ Sudah Jadi! Kualitas gambar sudah di-enhance.",
      recolor: "✅ Sudah Jadi! Warna gambar sudah dikoreksi.",
      hdr: "✅ Sudah Jadi! HDR effect sudah diterapkan.",
    };

    await sock.sendMessage(
      m.chat,
      {
        image: resultBuffer,
        caption: labels[mode] || "✅ Sudah Jadi!",
      },
      { quoted: m }
    );
  } catch (err) {
    console.error("[remini] Error:", err.message);
    await m.reply("❌ Proses gagal! Coba gambar lain atau coba lagi nanti.");
  } finally {
    // Unlock
    activeProcesses.delete(sender);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
