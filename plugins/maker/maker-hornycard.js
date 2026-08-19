// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Horny Card Generator
 * Buat "Horny Card" ID dengan avatar.
 * Uses @napi-rs/canvas (no external API needed).
 * Usage: .hornycard (tag/reply seseorang)
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic, getTargetJid, drawCircularImage } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "hornycard",
  alias: ["hornylicense", "horny"],
  category: "maker",
  description: "Buat Horny License ID dengan avatar",
  usage: ".hornycard @user (atau reply)",
  example: ".hornycard @628xxx",
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
    const name = m.pushName || "User";

    const W = 640;
    const H = 400;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background gradient (orange/red theme)
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1a0500");
    grad.addColorStop(0.5, "#4d1a00");
    grad.addColorStop(1, "#1a0500");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // Title
    ctx.fillStyle = "#ff6600";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HORNY LICENSE", W / 2, 60);
    ctx.textAlign = "left";

    // Subtitle
    ctx.fillStyle = "#ffaa66";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Official Horny Permit", W / 2, 85);
    ctx.textAlign = "left";

    // Avatar
    const avatarSize = 140;
    const avatarX = (W - avatarSize) / 2;
    const avatarY = 110;
    drawCircularImage(ctx, avatar, avatarX, avatarY, avatarSize);

    // Avatar border
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, W / 2, avatarY + avatarSize + 35);
    ctx.textAlign = "left";

    // ID Number
    const id = Math.floor(Math.random() * 900000 + 100000);
    ctx.fillStyle = "#cc8844";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`ID: HORNY-${id}`, W / 2, avatarY + avatarSize + 65);
    ctx.textAlign = "left";

    // Status
    const hornyLevel = Math.floor(Math.random() * 100);
    ctx.fillStyle = "#ff6600";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`HORNY LEVEL: ${hornyLevel}%`, W / 2, H - 50);
    ctx.textAlign = "left";

    // Footer
    ctx.fillStyle = "#aa6633";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Certified Horny Individual", W / 2, H - 25);
    ctx.textAlign = "left";

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `🃏 Horny License milik ${name} (${hornyLevel}% horny)`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
