// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "qrcode",
  alias: ["qrcode", "qr", "barcode", "generateqr"],
  category: "tools",
  description: "Buat QR code dari teks/link",
  usage: ".qrcode <teks>",
  example: ".qrcode https://wa.me/628xxxx",
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
    const text = m.text?.trim();

    if (!text) {
      const out =
        alyaHeader("Cara Pakai", "🔳") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}qrcode <teks/link>*`,
          `◦ Contoh: *${prefix}qrcode https://wa.me/628xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(out);
      return { handled: true };
    }

    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Gagal generate QR");

    const buffer = Buffer.from(await res.arrayBuffer());

    await sock.sendMessage(m.chat, {
      image: buffer,
      caption: `QR Code untuk: ${text}`,
    });

    const out =
      alyaHeader("QR Code", "🔳") +
      "\n\n" +
      bracketBox("🔳", "ʜᴀꜱɪʟ", [
        `◦ Text: *${text}*`,
        "◦ Format: *PNG*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}qrcode <teks> untuk buat QR lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    await m.reply(out);
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
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
