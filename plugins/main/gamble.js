// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "gamble",
  alias: ["bet", "taruhan", "judi", "roulette", "slot"],
  category: "game",
  description: "Taruh gold kamu untuk menang lebih banyak",
  usage: ".gamble <jumlah>",
  example: ".gamble 100",
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
    const amount = parseInt(m.text?.trim() || "0", 10);

    if (!amount || amount <= 0) {
      const text =
        alyaHeader("Cara Pakai", "🎰") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}gamble <jumlah gold>*`,
          `◦ Contoh: *${prefix}gamble 100*`,
          "◦ Minimal: *10 Gold*",
          "◦ Maksimal: *10000 Gold*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const win = Math.random() < 0.4;
    const multiplier = win ? Math.floor(Math.random() * 3) + 2 : 0;
    const result = win ? amount * multiplier : -amount;

    const emoji = win ? "🎉" : "💀";
    const status = win ? "MENANG" : "KALAH";

    const text =
      alyaHeader("Gamble", "🎰") +
      "\n\n" +
      bracketBox(emoji, "ʜᴀꜱɪʟ", [
        `◦ Taruhan: *${amount} Gold*`,
        `◦ Hasil: *${result} Gold*`,
        `◦ Multiplier: *${win ? "x" + multiplier : "x0"}*`,
        `◦ Status: *${status}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}gamble untuk main lagi`) +
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
