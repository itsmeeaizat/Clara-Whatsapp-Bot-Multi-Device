import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "guild",
  alias: ["klan", "clan", "guildrank", "g"],
  category: "game",
  description: "Buat/kelola guild RPG",
  usage: ".guild <nama>",
  example: ".guild Nightmare",
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
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Cara Pakai", "⚔️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}guild <nama guild>*`,
          `◦ Contoh: *${prefix}guild Nightmare*`,
          "◦ Harga: *500 Gold*",
          "◦ Max Member: *20*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    // Placeholder: ganti dengan logic guild RPG kamu
    const members = ["Player1", "Player2", "Player3", "Player4", "Player5"];

    const text =
      alyaHeader("Guild", "⚔️") +
      "\n\n" +
      bracketBox("⚔️", "ɢᴜɪʟᴅ", [
        `◦ Guild: *${query}*`,
        `◦ Leader: *${m.pushName || "Player"}*`,
        "◦ Level: *1*",
        `◦ Members: *${members.length}/20*`,
        "◦ Gold: *500*",
      ]) +
      "\n\n" +
      bracketBox("👥", "ᴍᴇᴍʙᴇʀꜱ", members.map((name) => `◦ ${name}`)) +
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
