import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "smeme",
  alias: ["smeme", "stickermeme", "stcmeme"],
  category: "sticker",
  description: "Buat sticker meme dari gambar (reply gambar)",
  usage: ".smeme <teks atas|teks bawah>",
  example: ".smeme INI ATAS|INI BAWAH",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const quoted = m.quoted;
    const text = m.text?.trim() || "";

    if (!quoted || !quoted.message?.imageMessage) {
      const reply =
        alyaHeader("Cara Pakai", "🎭") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Reply gambar dengan *${prefix}smeme <teks atas|teks bawah>*`,
          `◦ Contoh: *${prefix}smeme INI ATAS|INI BAWAH*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    const [topText, bottomText] = text.split("|").map(t => t.trim());

    const imgBuffer = await quoted.download();
    const { createCanvas, loadImage } = await import("@napi-rs/canvas");

    const img = await loadImage(imgBuffer);
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Draw image covering canvas
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

    // Meme text style
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.fillStyle = "#FFFFFF";

    if (topText) {
      const upperTop = topText.toUpperCase();
      ctx.fillText(upperTop, size / 2, 45);
      ctx.strokeText(upperTop, size / 2, 45);
    }

    if (bottomText) {
      const upperBottom = bottomText.toUpperCase();
      ctx.fillText(upperBottom, size / 2, size - 20);
      ctx.strokeText(upperBottom, size / 2, size - 20);
    }

    const buffer = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      sticker: buffer,
    }, { quoted: m });

    const info =
      alyaHeader("Sticker Meme", "🎭") +
      "\n\n" +
      bracketBox("🎭", "ʀᴇꜱᴜʟᴛ", [
        `◦ Atas: *${topText || "-"}*`,
        `◦ Bawah: *${bottomText || "-"}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Reply gambar dengan ${prefix}smeme untuk meme lain`);

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
