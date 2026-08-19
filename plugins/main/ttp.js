// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "ttp",
  alias: ["ttp", "texttopicture"],
  category: "maker",
  description: "Ubah teks jadi gambar (TTP)",
  usage: ".ttp <teks>",
  example: ".ttp Halo",
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
        alyaHeader("Cara Pakai", "🔤") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ttp <teks>*`,
          `◦ Contoh: *${prefix}ttp Halo*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    const { createCanvas, registerFont } = await import("@napi-rs/canvas");
    const fs = (await import("fs")).default;

    // Create canvas
    const fontSize = 60;
    const padding = 40;
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 512, 512);

    // White text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Word wrap
    const maxWidth = 512 - padding * 2;
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

    const lineHeight = fontSize * 1.3;
    const startY = 256 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, 256, startY + i * lineHeight);
    });

    const buffer = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      image: buffer,
      caption: `🔤 *TTP*\n◦ Teks: *${text}*`,
    }, { quoted: m });

    const info =
      alyaHeader("TTP", "🔤") +
      "\n\n" +
      bracketBox("🔤", "ʀᴇꜱᴜʟᴛ", [
        `◦ Teks: *${text}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ttp <teks> untuk TTP lain`);

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
