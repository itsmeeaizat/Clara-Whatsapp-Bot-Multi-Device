import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "toimg",
  alias: ["toimg", "toimage", "stickertoimg"],
  category: "sticker",
  description: "Convert sticker jadi gambar",
  usage: "Reply sticker dengan .toimg",
  example: ".toimg (reply sticker)",
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
    const quoted = m.quoted;

    if (!quoted || !quoted.message?.stickerMessage) {
      const text =
        alyaHeader("Cara Pakai", "🖼️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Reply sticker dengan *${prefix}toimg*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const buffer = await quoted.download();
    const sharp = (await import("sharp")).default;

    // Convert webp to png
    const pngBuffer = await sharp(buffer).png().toBuffer();

    await sock.sendMessage(m.chat, {
      image: pngBuffer,
      caption: `🖼️ *Sticker → Image*\n◦ Status: *Berhasil*`,
    }, { quoted: m });

    const info =
      alyaHeader("To Image", "🖼️") +
      "\n\n" +
      bracketBox("🖼️", "ʀᴇꜱᴜʟᴛ", [
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Reply sticker dengan ${prefix}toimg untuk convert lagi`);

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
