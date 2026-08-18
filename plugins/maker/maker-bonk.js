/**
 * Sticker — Bonk
 * Overlay "BONK" text on a quoted image/sticker.
 * Uses @napi-rs/canvas.
 * Usage: reply to image/sticker with .bonk
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";

const pluginConfig = {
  name: "bonk",
  alias: ["bonk"],
  category: "maker",
  description: "Buat meme BONK dari gambar yang di-reply",
  usage: ".bonk (reply gambar/sticker)",
  example: ".bonk",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!m.quoted) return m.reply("Reply gambar atau sticker!");
    const mime = m.quoted.mimetype || "";
    if (!/image|webp/.test(mime)) return m.reply("Reply gambar atau sticker bukan!");

    const buf = await m.quoted.download();
    if (!buf) return m.reply("Gagal download media.");

    const img = await loadImage(buf);
    const W = 512;
    const H = 512;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Draw the source image (fit/cover)
    const scale = Math.max(W / img.width, H / img.height);
    const sw = W / scale;
    const sh = H / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

    // BONK text
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.15);
    ctx.font = "bold 90px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,0,0,0.85)";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.strokeText("BONK!", 0, 0);
    ctx.fillText("BONK!", 0, 0);
    ctx.restore();

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
