/**
 * Kaneki Ken (Tokyo Ghoul) Mask Effect
 * Apply a Kaneki mask and Ghoul Kakugan eye effect on avatar.
 * Uses @napi-rs/canvas.
 * Usage: .kaneki @user
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic, getTargetJid, drawCircularImage } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "kaneki",
  alias: ["kanekimask", "kaneki"],
  category: "maker",
  description: "Apply a Kaneki (Tokyo Ghoul) mask and ghoul eye effect on avatar",
  usage: ".kaneki @user",
  example: ".kaneki @user",
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
    const H = 512;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Dark Tokyo Ghoul theme background
    const grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W);
    grad.addColorStop(0, "#2a0505");
    grad.addColorStop(0.5, "#140202");
    grad.addColorStop(1, "#050000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Red Kagune Blood Splatter / Lines in Background
    ctx.strokeStyle = "rgba(220, 38, 38, 0.25)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * H);
      ctx.bezierCurveTo(W / 3, Math.random() * H, (2 * W) / 3, Math.random() * H, W, Math.random() * H);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    // Title
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TOKYO GHOUL", W / 2, 55);

    ctx.fillStyle = "#991b1b";
    ctx.font = "14px sans-serif";
    ctx.fillText("東京喰種 - KANEKI KEN MODE", W / 2, 78);

    // Avatar Centered
    const avatarSize = 200;
    const avatarX = (W - avatarSize) / 2;
    const avatarY = 110;

    // Red aura around avatar
    ctx.fillStyle = "rgba(220, 38, 38, 0.3)";
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
    ctx.fill();

    drawCircularImage(ctx, avatar, avatarX, avatarY, avatarSize);

    // --- Overlay Effects ---

    // 1. Kaneki Mask (Lower face cover)
    const maskY = avatarY + avatarSize * 0.55;
    const maskRadius = avatarSize / 2;
    ctx.save();
    // Clip to circular avatar region for mask
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Mask shape (black leather cover)
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.ellipse(avatarX + avatarSize / 2, maskY + 30, maskRadius * 0.9, maskRadius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Zipper across mask
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(avatarX + avatarSize / 2 - 50, maskY + 25);
    ctx.lineTo(avatarX + avatarSize / 2 + 50, maskY + 25);
    ctx.stroke();

    // Zipper teeth details
    ctx.fillStyle = "#cbd5e1";
    for (let x = avatarX + avatarSize / 2 - 45; x <= avatarX + avatarSize / 2 + 45; x += 10) {
      ctx.fillRect(x, maskY + 20, 4, 10);
    }

    // Metallic bolts / studs
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2 - 55, maskY + 25, 5, 0, Math.PI * 2);
    ctx.arc(avatarX + avatarSize / 2 + 55, maskY + 25, 5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Kakugan Eye (Left Eye Overlay)
    const eyeX = avatarX + avatarSize * 0.35;
    const eyeY = avatarY + avatarSize * 0.38;

    // Dark sclera
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red iris
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeX - 2, eyeY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Red veins extending from Kakugan
    ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
    ctx.lineWidth = 1.5;
    const angles = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6];
    angles.forEach((ang) => {
      ctx.beginPath();
      ctx.moveTo(eyeX, eyeY);
      ctx.lineTo(eyeX + Math.cos(ang) * 28, eyeY + Math.sin(ang) * 28);
      ctx.stroke();
    });

    // 3. Right Eye Patch / Strap
    const rightEyeX = avatarX + avatarSize * 0.65;
    const rightEyeY = avatarY + avatarSize * 0.38;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(rightEyeX - 16, rightEyeY - 14, 32, 28);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.strokeRect(rightEyeX - 16, rightEyeY - 14, 32, 28);

    // Leather strap across right eye
    ctx.strokeStyle = "#1e1e1e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(avatarX, rightEyeY - 10);
    ctx.lineTo(avatarX + avatarSize, rightEyeY + 10);
    ctx.stroke();

    ctx.restore();

    // Avatar Border
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, W / 2, avatarY + avatarSize + 40);

    // Famous Quote / Status
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 22px monospace";
    ctx.fillText("1000 - 7 = ?", W / 2, H - 70);

    ctx.fillStyle = "#991b1b";
    ctx.font = "14px sans-serif";
    ctx.fillText("What is 1000 minus 7?", W / 2, H - 40);

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `👁️ 1000 - 7 = ? (${name} Ghoul Mode)`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
