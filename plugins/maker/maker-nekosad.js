// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Sad Neko Card Generator
 * Generate a "Sad Neko" card with avatar, dark blue/grey theme, tear drops, and sad cat styling.
 * Uses @napi-rs/canvas.
 * Usage: .nekosad @user
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic, getTargetJid, drawCircularImage } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "nekosad",
  alias: ["nekosad", "sadcat"],
  category: "maker",
  description: "Generate a Sad Neko card with avatar, dark blue/grey theme and tear effect",
  usage: ".nekosad @user",
  example: ".nekosad @user",
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

    // Dark blue / grey gradient theme
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0b1329");
    grad.addColorStop(0.5, "#1e293b");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Rain drop streaks in background
    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 25; i++) {
      const rx = (i * 26 + 10) % W;
      const ry = (i * 37) % H;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 5, ry + 25);
      ctx.stroke();
    }

    // Outer Frame
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, W - 30, H - 30);

    // Title
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("😿 SAD NEKO CARD 😿", W / 2, 60);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText("SAD CAT HOURS - DEPRESSION LEVEL 100%", W / 2, 82);

    // Avatar Centered or Left
    const avatarSize = 150;
    const avatarX = 60;
    const avatarY = 125;

    // --- Drooping Sad Cat Ears ---
    const centerX = avatarX + avatarSize / 2;
    const topY = avatarY;

    // Left Ear Outer (Drooping sideways)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(centerX - 40, topY + 20);
    ctx.lineTo(centerX - 80, topY + 15);
    ctx.lineTo(centerX - 30, topY - 10);
    ctx.closePath();
    ctx.fill();

    // Left Ear Inner (Sad Blue)
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(centerX - 42, topY + 16);
    ctx.lineTo(centerX - 72, topY + 13);
    ctx.lineTo(centerX - 33, topY - 5);
    ctx.closePath();
    ctx.fill();

    // Right Ear Outer (Drooping sideways)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(centerX + 40, topY + 20);
    ctx.lineTo(centerX + 80, topY + 15);
    ctx.lineTo(centerX + 30, topY - 10);
    ctx.closePath();
    ctx.fill();

    // Right Ear Inner
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(centerX + 42, topY + 16);
    ctx.lineTo(centerX + 72, topY + 13);
    ctx.lineTo(centerX + 33, topY - 5);
    ctx.closePath();
    ctx.fill();

    // Draw Circular Avatar
    drawCircularImage(ctx, avatar, avatarX, avatarY, avatarSize);

    // Avatar Border
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // --- Tear Effect (Small Blue Drops) ---
    const tears = [
      { x: centerX - 30, y: avatarY + avatarSize / 2 + 10, size: 8 },
      { x: centerX - 30, y: avatarY + avatarSize / 2 + 35, size: 12 },
      { x: centerX - 30, y: avatarY + avatarSize / 2 + 60, size: 6 },
      { x: centerX + 25, y: avatarY + avatarSize / 2 + 15, size: 10 },
      { x: centerX + 25, y: avatarY + avatarSize / 2 + 42, size: 14 },
      { x: centerX + 25, y: avatarY + avatarSize / 2 + 70, size: 7 },
    ];

    tears.forEach((t) => {
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Teardrop top tip
      ctx.beginPath();
      ctx.moveTo(t.x - t.size / 2, t.y);
      ctx.lineTo(t.x, t.y - t.size * 1.2);
      ctx.lineTo(t.x + t.size / 2, t.y);
      ctx.closePath();
      ctx.fill();

      // Highlight on teardrop
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(t.x - 1, t.y - 1, t.size / 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Name under avatar
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, avatarX + avatarSize / 2, avatarY + avatarSize + 30);

    // Right Info Box
    const infoX = 240;

    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.beginPath();
    ctx.roundRect(infoX, 120, 340, 160, 15);
    ctx.fill();

    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "left";

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("STATUS:", infoX + 20, 155);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "16px sans-serif";
    ctx.fillText("Depressed Neko", infoX + 110, 155);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("SADNESS:", infoX + 20, 190);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("100% MAXIMUM 😭", infoX + 110, 190);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("SOUND:", infoX + 20, 225);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "italic 16px sans-serif";
    ctx.fillText("Quiet sobbing nyaa...", infoX + 110, 225);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("QUOTE:", infoX + 20, 260);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "italic 14px sans-serif";
    ctx.fillText('"Why live nyaa...?"', infoX + 110, 260);

    // Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("💔 NEED HUGS & COMFORT IMMEDIATELY 💔", W / 2, H - 35);

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `😿 Sad Neko card milik ${name}...`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
