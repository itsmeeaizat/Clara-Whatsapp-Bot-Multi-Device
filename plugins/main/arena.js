import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "arena",
  alias: ["pvpg", "pvp", "duelrank", "fightrank"],
  category: "game",
  description: "Arena PVP leaderboard mingguan",
  usage: ".arena",
  example: ".arena",
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

    // Placeholder: ganti dengan data arena RPG kamu
    const top = [
      { name: "Player1", win: 24, loss: 2, streak: 12 },
      { name: "Player2", win: 21, loss: 4, streak: 9 },
      { name: "Player3", win: 19, loss: 5, streak: 7 },
      { name: "Player4", win: 17, loss: 6, streak: 5 },
      { name: "Player5", win: 15, loss: 7, streak: 4 },
    ];

    const lines = top.map((p, i) => {
      const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      return `${medal} ${p.name} - W:${p.win} L:${p.loss} Streak:${p.streak}`;
    });

    const text =
      alyaHeader("Arena", "⚔️") +
      "\n\n" +
      bracketBox("⚔️", "ɪɴꜰᴏ", [
        "◦ Mode: *Sementara*",
        "◦ Reset: *Minggu depan*",
        "◦ Total Match: *120*",
      ]) +
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
