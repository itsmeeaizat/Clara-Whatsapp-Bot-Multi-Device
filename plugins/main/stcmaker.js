import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "stcmaker",
  alias: ["stcmaker", "stickermaker", "stc"],
  category: "sticker",
  description: "Buat sticker dari teks",
  usage: ".stcmaker <teks>",
  example: ".stcmaker Halo",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const text = m.text?.trim();

    if (!text) {
      const reply =
        alyaHeader("Cara Pakai", "✏️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}stcmaker <teks>*`,
          `◦ Contoh: *${prefix}stcmaker Halo*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    const { createCanvas } = await import("@napi-rs/canvas");

    // Create square canvas for sticker
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Transparent background
    ctx.clearRect(0, 0, size, size);

    // White rounded background
    ctx.fillStyle = "#FFFFFF";
    const r = 40;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Black text
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Auto-fit font size
    let fontSize = 80;
    const maxWidth = size - 80;
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      ctx.font = `bold ${fontSize}px sans-serif`;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Reduce font size if too many lines
    while (lines.length * fontSize * 1.3 > size - 80 && fontSize > 20) {
      fontSize -= 5;
      lines.length = 0;
      currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        ctx.font = `bold ${fontSize}px sans-serif`;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
    }

    ctx.font = `bold ${fontSize}px sans-serif`;
    const lineHeight = fontSize * 1.3;
    const startY = size / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, size / 2, startY + i * lineHeight);
    });

    const buffer = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      sticker: buffer,
    }, { quoted: m });

    const info =
      alyaHeader("Sticker Maker", "✏️") +
      "\n\n" +
      bracketBox("✏️", "ʀᴇꜱᴜʟᴛ", [
        `◦ Teks: *${text}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}stcmaker <teks> untuk sticker lain`);

    await m.reply(info);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        `◦ Status: *Gagal*`,
        `◦ Alasan: *${error.message}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
