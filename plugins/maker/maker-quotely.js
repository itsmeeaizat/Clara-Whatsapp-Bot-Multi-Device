/**
 * Sticker — Quote (Quote as sticker)
 * Buat sticker dari quote teks dengan background.
 * Uses @napi-rs/canvas.
 * Usage: .qc <teks>
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadProfilePic } from "../../src/lib/clara-canvas-helper.js";

const pluginConfig = {
  name: "quotely",
  alias: ["qc", "quotesticker"],
  category: "maker",
  description: "Buat sticker quote dengan avatar dan teks",
  usage: ".qc <teks>",
  example: ".qc halo semuanya",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const COLORS = [
  ["#1a1a2e", "#16213e", "#0f3460"],
  ["#2d00f7", "#6a00f4", "#8900f2"],
  ["#f72585", "#b5179e", "#7209b7"],
  ["#480ca8", "#3a0ca3", "#3f37c9"],
  ["#4cc9f0", "#4895ef", "#4361ee"],
  ["#f9c80e", "#f86624", "#ea3546"],
  ["#43aa8b", "#90be6d", "#f9c74f"],
  ["#577590", "#43aa8b", "#90be6d"],
];

async function handler(m, { sock }) {
  const text = m.args?.join(" ") || (m.quoted?.text?.trim() || "");
  if (!text) {
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}qc halo semuanya`);
  }

  try {
    const avatarBuf = await downloadProfilePic(sock, m.sender);
    const avatar = avatarBuf ? await loadImage(avatarBuf) : null;
    const name = m.pushName || "User";

    // Pick random color scheme
    const [c1, c2, c3] = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Canvas size — dynamic based on text
    const W = 512;
    const padding = 40;
    // Pre-measure text

    // Pre-measure text
    const measureCanvas = createCanvas(W, 100);
    const mctx = measureCanvas.getContext("2d");
    mctx.font = "24px sans-serif";
    const maxWidth = W - padding * 2 - 60; // avatar space

    // Word wrap
    const words = text.split(" ");
    let lines = [];
    let line = "";
    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      if (mctx.measureText(testLine).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    lines = lines.slice(0, 10);

    const lineHeight = 32;
    const textBlockHeight = lines.length * lineHeight;
    const nameHeight = 20;
    const H = Math.max(200, textBlockHeight + nameHeight + padding * 2 + 40);

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, c2);
    grad.addColorStop(1, c3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Avatar (top-left)
    const avatarSize = 50;
    const avatarX = padding;
    const avatarY = padding;
    if (avatar) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    }

    // Name
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(name, avatarX + avatarSize + 10, avatarY + 22);

    // Quote text
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px sans-serif";
    let y = padding + avatarSize + 30;
    for (const l of lines) {
      ctx.fillText(l, padding, y);
      y += lineHeight;
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
