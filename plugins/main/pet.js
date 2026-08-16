import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "pet",
  alias: ["hewan", "pet", "kepet", "adopt"],
  category: "game",
  description: "Adopsi dan kelola pet RPG kamu",
  usage: ".pet <nama>",
  example: ".pet Kucing",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Cara Pakai", "🐾") +
        "\n\n" +
        bracketBox("📋", "ᴅᴀꜰᴛᴀʀ ᴘᴇᴛ", [
          "◦ 1. *Kucing* - 100 Gold",
          "◦ 2. *Anjing* - 150 Gold",
          "◦ 3. *Naga* - 500 Gold",
          "◦ 4. *Phoenix* - 1000 Gold",
        ]) +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}pet <nama>*`,
          `◦ Contoh: *${prefix}pet Kucing*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Pet", "🐾") +
      "\n\n" +
      bracketBox("🐾", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Nama: *${query}*`,
        "◦ Tipe: *Kucing*",
        "◦ Level: *1*",
        "◦ HP: *50/50*",
        "◦ ATK: *5*",
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
