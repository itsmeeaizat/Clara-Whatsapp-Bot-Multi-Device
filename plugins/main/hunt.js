import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "hunt",
  alias: ["hunting", "mburu", "monster", "hunt"],
  category: "game",
  description: "Berburu monster untuk dapat gold dan exp",
  usage: ".hunt",
  example: ".hunt",
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

    // Placeholder: ganti dengan logic hunt RPG kamu
    const monsters = [
      { name: "Slime", hp: 50, gold: 30, exp: 20 },
      { name: "Goblin", hp: 80, gold: 50, exp: 35 },
      { name: "Wolf", hp: 120, gold: 80, exp: 50 },
      { name: "Orc", hp: 200, gold: 150, exp: 80 },
      { name: "Dragon", hp: 500, gold: 500, exp: 200 },
    ];

    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    const killed = Math.random() < 0.7;

    const title = killed ? `Kamu berhasil membunuh ${monster.name}!` : `Kamu melarikan diri dari ${monster.name}...`;
    const emoji = killed ? "⚔️" : "🏃";

    const text =
      alyaHeader("Hunt", "⚔️") +
      "\n\n" +
      bracketBox(emoji, "ʜᴀꜱɪʟ", [
        `◦ Monster: *${monster.name}*`,
        `◦ HP: *${monster.hp}*`,
        `◦ Gold: *${killed ? "+" + monster.gold : "0"}*`,
        `◦ Exp: *${killed ? "+" + monster.exp : "0"}*`,
        `◦ Status: *${killed ? "DIBUNUH" : "LARIIIII"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}hunt untuk berburu lagi`) +
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
