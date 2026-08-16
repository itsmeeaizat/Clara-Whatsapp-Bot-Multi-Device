import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "leaderboards",
  alias: ["lb", "rank", "top", "peringkat", "leaderboard", "leaderboards"],
  category: "game",
  description: "Lihat peringkat player RPG",
  usage: ".leaderboards",
  example: ".leaderboards",
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

    const top = [
      { name: "Player1", level: 50, gold: 99999, wins: 120 },
      { name: "Player2", level: 45, gold: 75000, wins: 95 },
      { name: "Player3", level: 40, gold: 50000, wins: 80 },
      { name: "Player4", level: 35, gold: 30000, wins: 60 },
      { name: "Player5", level: 30, gold: 15000, wins: 45 },
    ];

    const lines = top.map((p, i) => {
      const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      return `${medal} ${p.name} - Lv.${p.level} - ${p.gold} Gold - W:${p.wins}`;
    });

    const text =
      alyaHeader("Leaderboards", "🏆") +
      "\n\n" +
      bracketBox("🏆", "ᴛᴏᴘ ᴘʟᴀʏᴇʀ", lines) +
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
