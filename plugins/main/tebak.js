// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tebak",
  alias: ["tebak", "guess", "tebakan", "tebak"],
  category: "game",
  description: "Tebak angka acak",
  usage: ".tebak <angka>",
  example: ".tebak 42",
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
    const input = m.text?.trim();

    if (!input) {
      const text =
        alyaHeader("Cara Pakai", "🎯") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}tebak <angka>*`,
          `◦ Contoh: *${prefix}tebak 42*`,
          "◦ Rentang: *1 - 100*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const guess = parseInt(input, 10);
    if (Number.isNaN(guess) || guess < 1 || guess > 100) {
      const text =
        alyaHeader("Tebak", "❌") +
        "\n\n" +
        bracketBox("❌", "ɢᴀɢᴀʟ", [
          "◦ Angka harus antara *1 - 100*.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const secret = Math.floor(Math.random() * 100) + 1;
    const win = guess === secret;

    const text =
      alyaHeader("Tebak", "🎯") +
      "\n\n" +
      bracketBox("🎯", "ʜᴀꜱɪʟ", [
        `◦ Tebakan: *${guess}*`,
        `◦ Jawaban: *${secret}*`,
        win ? "◦ Status: *Benar!*" : "◦ Status: *Salah!*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}tebak <angka> untuk main lagi`) +
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
