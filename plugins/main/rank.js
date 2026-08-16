import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "rank",
  alias: ["level", "up", "naiklevel", "rankup", "levelup"],
  category: "game",
  description: "Cek rank/level dan naik level",
  usage: ".rank",
  example: ".rank",
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
    const userId = m.sender;
    const userName = m.pushName || "Player";

    const player = db?.getRpgPlayer?.(userId) || {
      name: userName,
      level: 1,
      exp: 0,
      maxExp: 100,
      rank: "E",
      nextRank: "D",
      gold: 0,
    };

    const text =
      alyaHeader("Rank", "📈") +
      "\n\n" +
      bracketBox("📈", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Nama: *${player.name || userName}*`,
        `◦ Level: *${player.level || 1}*`,
        `◦ Rank: *${player.rank || "E"}*`,
        `◦ Next Rank: *${player.nextRank || "D"}*`,
        `◦ Exp: *${player.exp || 0}/${player.maxExp || 100}*`,
        `◦ Gold: *${player.gold || 0}*`,
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
