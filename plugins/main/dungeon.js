import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "dungeon",
  alias: ["dungeon", "instance", "raid", "dungeon"],
  category: "game",
  description: "Masuk dungeon untuk dapat loot langka",
  usage: ".dungeon",
  example: ".dungeon",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 600,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    // Placeholder: ganti dengan logic dungeon RPG kamu
    const dungeons = [
      { name: "Forest Dungeon", difficulty: "Easy", loot: "Wooden Sword" },
      { name: "Fire Cave", difficulty: "Medium", loot: "Fire Ring" },
      { name: "Ice Castle", difficulty: "Hard", loot: "Ice Armor" },
      { name: "Dark Abyss", difficulty: "Hell", loot: "Dark Blade" },
    ];

    const dungeon = dungeons[Math.floor(Math.random() * dungeons.length)];
    const cleared = Math.random() < 0.6;

    const text =
      alyaHeader("Dungeon", "🏰") +
      "\n\n" +
      bracketBox("🏰", "ʜᴀꜱɪʟ", [
        `◦ Dungeon: *${dungeon.name}*`,
        `◦ Difficulty: *${dungeon.difficulty}*`,
        `◦ Loot: *${cleared ? dungeon.loot : "Tidak ada"}*`,
        `◦ Status: *${cleared ? "CLEARED" : "FAILED"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}dungeon untuk masuk lagi`) +
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
