import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const pluginConfig = {
  name: "reaction",
  alias: ["reaction", "react", "emoji"],
  category: "group",
  description: "Beri reaksi ke pesan",
  usage: ".reaction <emoji>",
  example: ".reaction 🔥",
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
    const emoji = m.text?.trim();

    if (!emoji) {
      const text =
        alyaHeader("Reaction", "❤️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}reaction <emoji>*`,
          `◦ Contoh: *${prefix}reaction 🔥*`,
          `◦ Pilihan: ${EMOJIS.join(" ")}`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Reaction", "❤️") +
      "\n\n" +
      bracketBox("❤️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Emoji: *${emoji}*`,
        "◦ Status: *TERKIRIM*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}reaction <emoji> untuk reaksi lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
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
