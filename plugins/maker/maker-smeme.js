/**
 * Sticker — Meme (WM overlay)
 * Tambahkan watermark teks pada sticker.
 * Uses @napi-rs/canvas.
 * Usage: .smeme <teks atas> | <teks bawah> (reply gambar/sticker)
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";

const pluginConfig = {
  name: "smeme",
  alias: ["stickermeme", "memesticker"],
  category: "maker",
  description: "Buat meme sticker dengan teks atas & bawah",
  usage: ".smeme <teks atas> | <teks bawah> (reply gambar)",
  example: ".smeme ketawa | susah",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args?.join(" ") || "";
  const [topText, bottomText] = text.split("|").map(s => s.trim());

  if (!m.quoted) return m.reply("Reply gambar atau sticker!");
  const mime = m.quoted.mimetype || "";
  if (!/image|webp/.test(mime)) return m.reply("Reply gambar atau sticker!");

  try {
    const buf = await m.quoted.download();
    if (!buf) return m.reply("Gagal download media.");

    const img = await loadImage(buf);
    const W = 512;
    const H = 512;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Draw image (cover)
    const scale = Math.max(W / img.width, H / img.height);
    const sw = W / scale;
    const sh = H / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

    // Meme text style
    ctx.font = "bold 36px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    if (topText) {
      ctx.fillText(topText.toUpperCase(), W / 2, 50);
      ctx.strokeText(topText.toUpperCase(), W / 2, 50);
    }
    if (bottomText) {
      ctx.fillText(bottomText.toUpperCase(), W / 2, H - 20);
      ctx.strokeText(bottomText.toUpperCase(), W / 2, H - 20);
    }

    const out = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      sticker: out,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
