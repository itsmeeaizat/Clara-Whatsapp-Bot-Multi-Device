/**
 * Tool Blur Image
 * Blur image using @napi-rs/canvas. Reply to image.
 * Usage: .blur (reply image)
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";

const pluginConfig = {
  name: "blur",
  alias: ["blurimage", "blurimg", "blureffect"],
  category: "tools",
  description: "Blur image using @napi-rs/canvas. Reply to image.",
  usage: ".blur (reply gambar)",
  example: ".blur",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const isQuotedImage = m.quoted && /image/.test(m.quoted.mimetype || "");
    const isImage = /image/.test(m.mimetype || "");

    if (!isQuotedImage && !isImage) {
      return m.reply(`Reply gambar atau kirim gambar dengan caption ${m.prefix || "."}blur`);
    }

    await m.reply("⏳ *Memproses blur gambar...*");

    const imgBuffer = isQuotedImage ? await m.quoted.download() : await m.download();
    if (!imgBuffer) return m.reply("❌ Gagal mengunduh gambar.");

    const img = await loadImage(imgBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    // Downscale and upscale blur approach with filter for smooth gaussian blur
    const scale = 0.1;
    const sw = Math.max(1, Math.floor(img.width * scale));
    const sh = Math.max(1, Math.floor(img.height * scale));

    const smallCanvas = createCanvas(sw, sh);
    const smallCtx = smallCanvas.getContext("2d");
    smallCtx.imageSmoothingEnabled = true;
    smallCtx.drawImage(img, 0, 0, sw, sh);

    ctx.imageSmoothingEnabled = true;
    ctx.filter = "blur(8px)";
    ctx.drawImage(smallCanvas, 0, 0, img.width, img.height);

    const blurredBuffer = canvas.toBuffer("image/png");

    await sock.sendMessage(
      m.chat,
      {
        image: blurredBuffer,
        caption: "✨ *Gambar berhasil di-blur!*",
      },
      { quoted: m }
    );
  } catch (err) {
    await m.reply(`❌ Gagal memproses blur: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
