// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Neko Girl Card Generator
 * Generate a "Neko Girl" card with cat ears overlay on avatar and pastel background.
 * Uses @napi-rs/canvas.
 * Usage: .nekogirl @user
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic, getTargetJid, drawCircularImage } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "nekogirl",
  alias: ["nekogirl", "catgirl"],
  category: "maker",
  description: "Generate a Neko Girl card with cat ears overlay on avatar",
  usage: ".nekogirl @user",
  example: ".nekogirl @user",
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
    const target = getTargetJid(m);
    const avatarBuf = await downloadProfilePic(sock, target);
    if (!avatarBuf) throw new Error("Gagal mengambil avatar");

    const avatar = await loadImage(avatarBuf);
    const name = (m.pushName && target === m.sender) ? m.pushName : (target.split("@")[0] || "User");

    const W = 640;
    const H = 400;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Pastel Gradient Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#e9d5ff");
    grad.addColorStop(0.5, "#fbcfe8");
    grad.addColorStop(1, "#f3e8ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Card Outer Frame
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.roundRect(15, 15, W - 30, H - 30, 20);
    ctx.fill();

    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Title
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🐾 NEKO GIRL CARD 🐾", W / 2, 60);

    ctx.fillStyle = "#ec4899";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("KAWAII CATGIRL CERTIFICATE", W / 2, 82);

    // Avatar Centered or Left
    const avatarSize = 150;
    const avatarX = 60;
    const avatarY = 125;

    // --- Cat Ears Triangles (drawn ABOVE avatar circle) ---
    const centerX = avatarX + avatarSize / 2;
    const topY = avatarY;

    // Left Ear Outer
    ctx.fillStyle = "#7e22ce";
    ctx.beginPath();
    ctx.moveTo(centerX - 60, topY + 15);
    ctx.lineTo(centerX - 75, topY - 45);
    ctx.lineTo(centerX - 15, topY - 10);
    ctx.closePath();
    ctx.fill();

    // Left Ear Inner (Pink)
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.moveTo(centerX - 55, topY + 10);
    ctx.lineTo(centerX - 68, topY - 35);
    ctx.lineTo(centerX - 22, topY - 8);
    ctx.closePath();
    ctx.fill();

    // Right Ear Outer
    ctx.fillStyle = "#7e22ce";
    ctx.beginPath();
    ctx.moveTo(centerX + 60, topY + 15);
    ctx.lineTo(centerX + 75, topY - 45);
    ctx.lineTo(centerX + 15, topY - 10);
    ctx.closePath();
    ctx.fill();

    // Right Ear Inner (Pink)
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.moveTo(centerX + 55, topY + 10);
    ctx.lineTo(centerX + 68, topY - 35);
    ctx.lineTo(centerX + 22, topY - 8);
    ctx.closePath();
    ctx.fill();

    // Draw Circular Avatar
    drawCircularImage(ctx, avatar, avatarX, avatarY, avatarSize);

    // Avatar Border
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Whiskers overlay on sides of avatar
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    // Left Whiskers
    ctx.beginPath();
    ctx.moveTo(avatarX - 5, avatarY + avatarSize / 2 - 10);
    ctx.lineTo(avatarX - 25, avatarY + avatarSize / 2 - 20);
    ctx.moveTo(avatarX - 8, avatarY + avatarSize / 2 + 5);
    ctx.lineTo(avatarX - 28, avatarY + avatarSize / 2 + 5);
    ctx.moveTo(avatarX - 5, avatarY + avatarSize / 2 + 20);
    ctx.lineTo(avatarX - 25, avatarY + avatarSize / 2 + 30);
    ctx.stroke();

    // Right Whiskers
    ctx.beginPath();
    ctx.moveTo(avatarX + avatarSize + 5, avatarY + avatarSize / 2 - 10);
    ctx.lineTo(avatarX + avatarSize + 25, avatarY + avatarSize / 2 - 20);
    ctx.moveTo(avatarX + avatarSize + 8, avatarY + avatarSize / 2 + 5);
    ctx.lineTo(avatarX + avatarSize + 28, avatarY + avatarSize / 2 + 5);
    ctx.moveTo(avatarX + avatarSize + 5, avatarY + avatarSize / 2 + 20);
    ctx.lineTo(avatarX + avatarSize + 25, avatarY + avatarSize / 2 + 30);
    ctx.stroke();

    // Name under avatar
    ctx.fillStyle = "#6b21a8";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, avatarX + avatarSize / 2, avatarY + avatarSize + 30);

    // Right Info Box
    const infoX = 240;

    ctx.fillStyle = "#f3e8ff";
    ctx.beginPath();
    ctx.roundRect(infoX, 120, 340, 160, 15);
    ctx.fill();

    ctx.strokeStyle = "#d8b4fe";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "left";

    ctx.fillStyle = "#7e22ce";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("TYPE:", infoX + 20, 155);
    ctx.fillStyle = "#374151";
    ctx.font = "16px sans-serif";
    ctx.fillText("Kawaii Neko Girl", infoX + 110, 155);

    ctx.fillStyle = "#7e22ce";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("SOUND:", infoX + 20, 190);
    ctx.fillStyle = "#ec4899";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("Nyaa~ Nyaa~ 💕", infoX + 110, 190);

    ctx.fillStyle = "#7e22ce";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("MOOD:", infoX + 20, 225);
    ctx.fillStyle = "#374151";
    ctx.font = "16px sans-serif";
    ctx.fillText("Playful & Cuddly", infoX + 110, 225);

    ctx.fillStyle = "#7e22ce";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("FAVORITE:", infoX + 20, 260);
    ctx.fillStyle = "#374151";
    ctx.font = "16px sans-serif";
    ctx.fillText("Fish & Headpats", infoX + 110, 260);

    // Footer
    ctx.fillStyle = "#9333ea";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ CERTIFIED KAWAII NEKO GIRL ✨", W / 2, H - 35);

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `🐾 Neko Girl card milik ${name} (Nyaa~!)`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
