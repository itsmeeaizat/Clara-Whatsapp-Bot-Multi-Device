import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "boss",
  alias: ["bossbattle", "raid", "attackboss", "bossfight"],
  category: "game",
  description: "Serang boss bersama-sama di grup",
  usage: ".boss",
  example: ".boss",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 300,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    // Placeholder: ganti dengan logic boss RPG kamu
    const bossHp = 5000;
    const damage = Math.floor(Math.random() * 300) + 50;
    const remaining = Math.max(0, bossHp - damage);
    const killed = remaining <= 0;

    const text =
      alyaHeader("Boss Battle", "👑") +
      "\n\n" +
      bracketBox("👑", "ʙᴏꜱꜱ", [
        "◦ Boss: *Raksasa Kegelapan*",
        `◦ Damage: *-${damage}*`,
        `◦ Sisa HP: *${killed ? "0" : remaining}*`,
        `◦ Status: *${killed ? "Dikalahkan" : "Masih bertahan"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}boss untuk serang lagi`) +
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
