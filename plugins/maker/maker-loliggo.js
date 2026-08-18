/**
 * LOLI GGO Card Generator
 * Generate a "LOLI GGO" style card with avatar and cute styling.
 * Uses @napi-rs/canvas.
 * Usage: .loliggo @user
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic, getTargetJid, drawCircularImage } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "loliggo",
  alias: ["loligo", "loliggo"],
  category: "maker",
  description: "Generate a LOLI GGO style card with avatar and cute styling",
  usage: ".loliggo @user",
  example: ".loliggo @user",
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

    // Light pink / white gradient background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#fff0f5");
    grad.addColorStop(0.5, "#ffe4e1");
    grad.addColorStop(1, "#fff5f7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Cute background pattern / dots
    ctx.fillStyle = "rgba(255, 182, 193, 0.3)";
    for (let x = 20; x < W; x += 40) {
      for (let y = 20; y < H; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Card Outer Frame
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(15, 15, W - 30, H - 30, 20);
    ctx.fill();

    ctx.strokeStyle = "#ffb6c1";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = "#ff69b4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(22, 22, W - 44, H - 44, 15);
    ctx.stroke();

    // Header Title
    ctx.fillStyle = "#ff1493";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("★ LOLI GGO CARD ★", W / 2, 60);

    ctx.fillStyle = "#ff69b4";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("GUN GALE ONLINE - PINK SQUAD", W / 2, 82);

    // Avatar
    const avatarSize = 140;
    const avatarX = 55;
    const avatarY = 110;

    // Outer avatar glow/ring
    ctx.fillStyle = "#ffe4e1";
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
    ctx.fill();

    drawCircularImage(ctx, avatar, avatarX, avatarY, avatarSize);

    // Avatar Border
    ctx.strokeStyle = "#ff1493";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Name under avatar
    ctx.fillStyle = "#d81b60";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, avatarX + avatarSize / 2, avatarY + avatarSize + 32);

    // Right Side Info Panel
    const infoX = 230;

    ctx.fillStyle = "#fff0f5";
    ctx.beginPath();
    ctx.roundRect(infoX, 105, 350, 175, 15);
    ctx.fill();

    ctx.strokeStyle = "#ffb6c1";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "left";

    // Stats
    ctx.fillStyle = "#d81b60";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("CLASS:", infoX + 20, 138);
    ctx.fillStyle = "#444444";
    ctx.font = "15px sans-serif";
    ctx.fillText("Pink Loli Sniper", infoX + 110, 138);

    ctx.fillStyle = "#d81b60";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("WEAPON:", infoX + 20, 170);
    ctx.fillStyle = "#444444";
    ctx.font = "15px sans-serif";
    ctx.fillText("P-Chan (P90 Pink)", infoX + 110, 170);

    ctx.fillStyle = "#d81b60";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("AGILITY:", infoX + 20, 202);
    ctx.fillStyle = "#444444";
    ctx.font = "15px sans-serif";
    ctx.fillText("MAX SPEED ⚡", infoX + 110, 202);

    ctx.fillStyle = "#d81b60";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("CUTENESS:", infoX + 20, 234);
    ctx.fillStyle = "#ff1493";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("999,999,999 CP", infoX + 110, 234);

    ctx.fillStyle = "#d81b60";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("STATUS:", infoX + 20, 266);
    ctx.fillStyle = "#2e7d32";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("PROTECT & CARE ✓", infoX + 110, 266);

    // Footer
    ctx.fillStyle = "#ff69b4";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🌸 OFFICIAL GUN GALE ONLINE LOLI LICENSE 🌸", W / 2, H - 35);

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `💖 LOLI GGO Card milik ${name}`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
