import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "nulis",
  alias: ["nulis", "tulis", "nulismbok"],
  category: "maker",
  description: "Ubah teks jadi gambar tulisan di buku",
  usage: ".nulis <teks>",
  example: ".nulis Hari ini aku belajar",
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
          `◦ Penggunaan: *${prefix}nulis <teks>*`,
          `◦ Contoh: *${prefix}nulis Hari ini aku belajar*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    const { createCanvas } = await import("@napi-rs/canvas");

    // Create canvas resembling lined paper
    const canvas = createCanvas(800, 1000);
    const ctx = canvas.getContext("2d");

    // White paper background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 800, 1000);

    // Red margin line
    ctx.strokeStyle = "#FF4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 0);
    ctx.lineTo(100, 1000);
    ctx.stroke();

    // Blue horizontal lines
    ctx.strokeStyle = "#4444FF";
    ctx.lineWidth = 1;
    const lineHeight = 50;
    for (let y = 80; y < 1000; y += lineHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Write text
    ctx.fillStyle = "#222222";
    ctx.font = "32px serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const maxWidth = 800 - 120;
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    let y = 70;
    for (const line of lines) {
      ctx.fillText(line, 120, y);
      y += lineHeight;
      if (y > 980) break;
    }

    const buffer = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buffer,
      caption: `✏️ *Nulis*\n◦ Teks: *${text}*`,
    }, { quoted: m });

    const info =
      alyaHeader("Nulis", "✏️") +
      "\n\n" +
      bracketBox("✏️", "ʀᴇꜱᴜʟᴛ", [
        `◦ Teks: *${text}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}nulis <teks> untuk nulis lagi`);

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
