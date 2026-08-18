/**
 * Age Card Generator
 * Generate an "Age Card" showing avatar, name, and a random age (1-99) with funny commentary.
 * Uses @napi-rs/canvas.
 * Usage: .age @user
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic, getTargetJid, drawCircularImage } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "age",
  alias: ["agecard", "umur"],
  category: "maker",
  description: "Generate an Age Card showing avatar, name, and estimated age with funny commentary",
  usage: ".age @user",
  example: ".age @user",
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

    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(0.5, "#121829");
    grad.addColorStop(1, "#0d111e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Card Outer Border & Glow
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, W - 36, H - 36);

    // Title Header
    ctx.fillStyle = "#60a5fa";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AGE ESTIMATION CARD", W / 2, 55);

    ctx.fillStyle = "#93c5fd";
    ctx.font = "13px sans-serif";
    ctx.fillText("AI FACIAL AGE SCANNER", W / 2, 78);

    // Left Side: Avatar
    const avatarSize = 150;
    const avatarX = 50;
    const avatarY = 110;

    // Glowing circle behind avatar
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
    ctx.fill();

    drawCircularImage(ctx, avatar, avatarX, avatarY, avatarSize);

    // Border around avatar
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Name under avatar
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, avatarX + avatarSize / 2, avatarY + avatarSize + 30);

    // Right Side: Prominent Age Number & Details
    const rightX = 230;

    // Age Box Background
    ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
    ctx.beginPath();
    ctx.roundRect(rightX, 110, 360, 160, 15);
    ctx.fill();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Random Age Generation (1-99)
    const age = Math.floor(Math.random() * 99) + 1;

    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ESTIMATED AGE", rightX + 20, 140);

    // Large Age Number
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText(`${age}`, rightX + 20, 210);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("years old", rightX + 110, 205);

    // Commentary based on age
    let comment = "";
    if (age <= 12) comment = "Bocil kematian, masih ngompol ya?";
    else if (age <= 19) comment = "Anak skena, jiwa muda lagi bergejolak!";
    else if (age <= 29) comment = "Quarter life crisis & encok pegel linu.";
    else if (age <= 45) comment = "Umur produktif, jangan lupa bayar cicilan!";
    else if (age <= 65) comment = "Sudah sepuh, saatnya rehat & menikmati hidup.";
    else comment = "Kakek/Nenek legend, sepuh abadi tanah air!";

    ctx.fillStyle = "#fbbf24";
    ctx.font = "italic 14px sans-serif";
    ctx.fillText(`"${comment}"`, rightX + 20, 248);

    // Footer / Scan Result Status
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN CONFIDENCE: 99.8% VERIFIED ✓", W / 2, H - 35);

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `🎂 Perkiraan umur ${name}: ${age} tahun!`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
