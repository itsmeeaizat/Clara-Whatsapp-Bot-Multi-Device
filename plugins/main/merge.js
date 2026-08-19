// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "merge",
  alias: ["merge", "gabung", "craft", "combine", "fusion"],
  category: "game",
  description: "Gabungkan 2 item menjadi item lebih kuat",
  usage: ".merge <item1> <item2>",
  example: ".merge Sword Shield",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = m.text?.trim().split(/\s+/);
    const item1 = args?.[0];
    const item2 = args?.[1];

    if (!item1 || !item2) {
      const text =
        alyaHeader("Cara Pakai", "🛠️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}merge <item1> <item2>*`,
          `◦ Contoh: *${prefix}merge Sword Shield*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Merge", "🛠️") +
      "\n\n" +
      bracketBox("🛠️", "ʜᴀꜱɪʟ", [
        `◦ Item 1: *${item1}*`,
        `◦ Item 2: *${item2}*`,
        "◦ Hasil: *Super Sword*",
        "◦ Bonus: *+20% ATK*",
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
