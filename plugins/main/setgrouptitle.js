// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "setgrouptitle",
  alias: ["setgrouptitle", "gantititle", "gctitle", "setgtitle"],
  category: "group",
  description: "Ganti title grup",
  usage: ".setgrouptitle <title>",
  example: ".setgrouptitle RPG Master",
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
    const title = m.text?.trim();

    if (!title) {
      const text =
        alyaHeader("Cara Pakai", "🏅") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}setgrouptitle <title>*`,
          `◦ Contoh: *${prefix}setgrouptitle RPG Master*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.groupMetadataUpdate(m.chat, { subject: title });

    const text =
      alyaHeader("Set Group Title", "🏅") +
      "\n\n" +
      bracketBox("🏅", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Title Baru: *${title}*`,
        `◦ Group: *${m.chat}*`,
        "◦ Status: *SUCCESS*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
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
