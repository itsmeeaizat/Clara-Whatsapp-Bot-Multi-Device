/**
 * It's So Stupid Meme Generator
 * Buat meme "It's so stupid" dengan avatar dan teks.
 * Uses @napi-rs/canvas (no external API needed).
 * Usage: .itssostupid <teks> (tag/reply seseorang)
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic, getTargetJid, drawCircularImage } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "itssostupid",
  alias: ["iss", "stupid"],
  category: "maker",
  description: "Buat meme 'It's so stupid' dengan avatar",
  usage: ".itssostupid <teks> @user",
  example: ".itssostupid im stupid",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args?.join(" ") || "im stupid";
  try {
    const target = getTargetJid(m);
    const avatarBuf = await downloadProfilePic(sock, target);
    if (!avatarBuf) throw new Error("Gagal mengambil avatar");

    const avatar = await loadImage(avatarBuf);

    const W = 640;
    const H = 480;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background (comic style)
    ctx.fillStyle = "#f0e6d2";
    ctx.fillRect(0, 0, W, H);

    // Top section — avatar
    const avatarSize = 200;
    const avatarX = (W - avatarSize) / 2;
    const avatarY = 30;

    // Avatar background circle
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
    ctx.fill();

    drawCircularImage(ctx, avatar, avatarX, avatarY, avatarSize);

    // Avatar border
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Speech bubble
    const bubbleY = avatarY + avatarSize + 40;
    const bubbleH = 120;
    const bubbleX = 60;
    const bubbleW = W - 120;

    // Bubble background
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 20);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bubble tail (pointing up to avatar)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(W / 2 - 20, bubbleY);
    ctx.lineTo(W / 2, bubbleY - 20);
    ctx.lineTo(W / 2 + 20, bubbleY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text in bubble
    ctx.fillStyle = "#333333";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, W / 2, bubbleY + 60);
    ctx.font = "18px sans-serif";
    ctx.fillText("- it's so stupid", W / 2, bubbleY + 95);
    ctx.textAlign = "left";

    const buf = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `🤦 It's so stupid meme`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
