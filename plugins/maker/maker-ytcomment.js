// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * YouTube Comment Generator
 * Buat fake YouTube comment dengan avatar.
 * Uses @napi-rs/canvas (no external API needed).
 * Usage: .ytcomment <teks>
 */

import { createCanvas, loadImage, registerFont } from "@napi-rs/canvas";
import { downloadProfilePic } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "ytcomment",
  alias: ["ytkomen", "ytcomment"],
  category: "maker",
  description: "Buat fake YouTube comment dengan avatar kamu",
  usage: ".ytcomment <teks>",
  example: ".ytcomment botnya keren banget",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args?.join(" ");
  if (!text) {
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}ytcomment botnya keren banget`);
  }

  try {
    const avatarBuf = await downloadProfilePic(sock, m.sender);
    const avatar = await loadImage(avatarBuf);

    const W = 720;
    const H = 180;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background (YouTube dark theme)
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, W, H);

    // Avatar (circular)
    const avatarSize = 48;
    const avatarX = 24;
    const avatarY = 24;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Username
    const username = m.pushName || "User";
    ctx.fillStyle = "#aaa";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(username, avatarX + avatarSize + 12, avatarY + 16);

    // Timestamp
    const timeStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    ctx.fillStyle = "#717171";
    ctx.font = "12px sans-serif";
    const usernameWidth = ctx.measureText(username).width;
    ctx.fillText(timeStr, avatarX + avatarSize + 12 + usernameWidth + 10, avatarY + 16);

    // Comment text (word wrap)
    ctx.fillStyle = "#f1f1f1";
    ctx.font = "14px sans-serif";
    const maxWidth = W - avatarX - avatarSize - 24 - 12;
    const words = text.split(" ");
    let line = "";
    let y = avatarY + 40;
    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      if (ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(line, avatarX + avatarSize + 12, y);
        line = word;
        y += 20;
        if (y > H - 20) break;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, avatarX + avatarSize + 12, y);

    // Likes bar
    y += 28;
    ctx.fillStyle = "#909090";
    ctx.font = "12px sans-serif";
    ctx.fillText("👍 " + Math.floor(Math.random() * 999) + "   👎", avatarX + avatarSize + 12, y);
    ctx.fillText("Reply", avatarX + avatarSize + 12 + 120, y);

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `💬 YouTube Comment oleh ${username}`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
