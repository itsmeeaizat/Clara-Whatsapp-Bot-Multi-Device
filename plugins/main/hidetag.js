// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "hidetag",
  alias: ["hidetag", "ht", "tagall", "mention"],
  category: "group",
  description: "Tag semua member grup",
  usage: ".hidetag <teks>",
  example: ".hidetag Hai semua!",
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
      const reply =
        alyaHeader("Cara Pakai", "📢") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}hidetag <teks>*`,
          `◦ Contoh: *${prefix}hidetag Hai semua!*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    const info =
      alyaHeader("Hidetag", "📢") +
      "\n\n" +
      bracketBox("📢", "ᴛᴀɢ", [
        `◦ Pesan: *${text}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(info);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const reply =
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

    await m.reply(reply);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
