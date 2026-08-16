import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "marry",
  alias: ["wedding", "nikah", "pasangan", "couple", "love"],
  category: "game",
  description: "Nikahi player lain di grup",
  usage: ".marry @member",
  example: ".marry @628xxxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const target = m.mentionedJid?.[0];

    if (!target) {
      const text =
        alyaHeader("Cara Pakai", "💍") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}marry @member*`,
          `◦ Contoh: *${prefix}marry @628xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Marriage", "💍") +
      "\n\n" +
      bracketBox("💍", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Kamu: *${m.pushName || "Player"}*`,
        `◦ Pasangan: *${target}*`,
        "◦ Status: *Married*",
        "◦ Bonus: *+5% EXP*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Selamat! Kamu sekarang married`) +
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
