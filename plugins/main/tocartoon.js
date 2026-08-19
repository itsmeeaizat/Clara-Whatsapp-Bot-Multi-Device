/**
 * AI Cartoon — Photo to Cartoon
 * ---------------------------------------------------------------
 * Recode bersih dari plugin ai-cartoon.js (Clara Aizat/Clara-MD) yang
 * di-obfuscate. Menggunakan API imglarger.com/PhoAi.
 *
 * Fitur:
 *  - .tocartoon / .cartoon → ubah foto jadi kartun
 *
 * Cara pakai: reply gambar dengan command.
 */

import axios from "axios";
import jimp from "jimp";

// Track active processes per sender (anti-spam)
const activeProcesses = new Map();

const UPLOAD_URL = "https://access1.imglarger.com/PhoAi/Upload";
const STATUS_URL = "https://access1.imglarger.com/PhoAi/CheckStatus";

const pluginConfig = {
  name: "tocartoon",
  alias: ["tocartoon", "cartoon"],
  category: "ai",
  description: "Ubah foto menjadi kartun. Reply gambar dengan command ini.",
  usage: ".tocartoon (reply gambar)",
  example: ".tocartoon",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

/**
 * Convert image buffer ke base64 menggunakan jimp
 */
async function getBase64Image(buffer) {
  const image = await jimp.read(buffer);
  const base64 = await image.getBase64Async(jimp.MIME_JPEG);
  return base64.split(",")[1]; // remove "data:image/jpeg;base64," prefix
}

/**
 * Upload gambar ke imglarger untuk cartoon conversion
 * Lalu poll status sampai selesai
 */
async function cartoonize(imageBuffer) {
  // Step 1: Convert ke base64
  const base64Image = await getBase64Image(imageBuffer);

  // Step 2: Upload ke API
  const uploadRes = await axios.post(
    UPLOAD_URL,
    {
      type: 11, // type 11 = cartoon
      base64Image,
    },
    {
      headers: {
        Connection: "keep-alive",
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const { code, type } = uploadRes.data.data;
  if (!code) throw new Error("Gagal upload gambar ke server");

  // Step 3: Poll status sampai selesai
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2s per poll

    const statusRes = await axios.post(
      STATUS_URL,
      {
        code,
        isMember: 0,
        type,
      },
      {
        headers: {
          Connection: "keep-alive",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const status = statusRes.data?.data?.status;

    if (status === "success") {
      const downloadUrls = statusRes.data?.data?.downloadUrls;
      if (downloadUrls && downloadUrls.length > 0) {
        return {
          message: "success",
          download: {
            full: downloadUrls[0],
            head: downloadUrls[1] || downloadUrls[0],
          },
        };
      }
    }

    if (status === "noface") {
      return { message: "noface" };
    }
  }

  throw new Error("Timeout menunggu hasil dari server");
}

async function handler(m, { sock, config }) {
  const sender = m.sender;

  // Anti-spam
  if (activeProcesses.has(sender)) {
    await m.reply("⏳ Masih ada proses yang belum selesai, tunggu dulu ya!");
    return { handled: true };
  }

  // Ambil gambar dari reply
  const quoted = m.quoted;
  if (!quoted) {
    await m.reply("❌ Reply gambar yang mau dijadikan kartun!");
    return { handled: true };
  }

  const mimeType = quoted?.mimetype || quoted?.message?.imageMessage?.mimetype || "";

  if (!mimeType) {
    await m.reply("❌ Itu bukan gambar! Reply gambar dengan command ini.");
    return { handled: true };
  }

  if (!/image\/(jpe?g|png)/.test(mimeType)) {
    await m.reply(`❌ Mime ${mimeType} tidak support! Hanya JPEG/PNG.`);
    return { handled: true };
  }

  // Lock proses
  activeProcesses.set(sender, true);

  try {
    await m.reply("🔄 Proses Kak... Mungkin butuh beberapa detik.");

    // Download gambar
    const imageBuffer = await sock.downloadMediaMessage(quoted);

    if (!imageBuffer) {
      await m.reply("❌ Gagal mengunduh gambar!");
      return { handled: true };
    }

    // Proses cartoon
    const result = await cartoonize(imageBuffer);

    if (result.message === "noface") {
      await m.reply("😔 Maaf, di fotonya tidak terdeteksi wajah. Coba foto lain ya!");
      return { handled: true };
    }

    if (!result.download?.full) {
      await m.reply("❌ Proses gagal! Coba lagi nanti.");
      return { handled: true };
    }

    // Download hasil dan kirim
    const imageRes = await axios.get(result.download.full, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    await sock.sendMessage(
      m.chat,
      {
        image: Buffer.from(imageRes.data),
        caption: "✅ Sudah Jadi Kak! >//<",
      },
      { quoted: m }
    );
  } catch (err) {
    console.error("[tocartoon] Error:", err.message);
    await m.reply("❌ Proses gagal! Coba gambar lain atau coba lagi nanti.");
  } finally {
    activeProcesses.delete(sender);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
