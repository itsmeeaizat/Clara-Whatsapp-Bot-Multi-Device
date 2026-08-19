// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tictactoe",
  alias: ["tictactoe", "ttt", "exxo", "tictactoe"],
  category: "game",
  description: "Main Tic Tac Toe",
  usage: ".tictactoe <@target>",
  example: ".tictactoe @username",
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
    const targetRaw = m.text?.trim();

    if (!targetRaw) {
      const text =
        alyaHeader("Cara Pakai", "❌⭕") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}tictactoe <@target>*`,
          `◦ Contoh: *${prefix}tictactoe @username*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const targetName = targetRaw.replace(/^@+/, "") || targetRaw;

    const text =
      alyaHeader("Tic Tac Toe", "❌⭕") +
      "\n\n" +
      bracketBox("❌⭕", "ɢᴀᴍᴇ", [
        `◦ Player 1: *Kamu*`,
        `◦ Player 2: *${targetName}*`,
        "◦ Status: *Game dimulai*",
      ]) +
      "\n\n" +
      separator() +
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
