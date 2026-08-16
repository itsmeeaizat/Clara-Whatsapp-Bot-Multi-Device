import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "leaderboard",
  alias: ["lb", "rank", "top", "peringkat", "leaderboard"],
  category: "game",
  description: "Lihat peringkat player RPG terkuat",
  usage: ".leaderboard",
  example: ".leaderboard",
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
    const db = getDatabase();
    const users = db.getAllUsers();

    const leaderboard = Object.entries(users)
      .map(([jid, user]) => {
        const rpg = user?.rpg || {};
        return {
          id: jid,
          name: rpg?.name || user?.name || "Player",
          level: rpg?.level || 1,
          gold: rpg?.gold || 0,
          exp: rpg?.exp || 0,
        };
      })
      .filter((u) => u.exp > 0 || u.gold > 0)
      .sort((a, b) => b.exp - a.exp || b.gold - a.gold)
      .slice(0, 5);

    if (!leaderboard.length) {
      const text =
        alyaHeader("Leaderboard", "🏆") +
        "\n\n" +
        bracketBox("🏆", "ᴛᴏᴘ ᴘʟᴀʏᴇʀ", [
          "◦ Belum ada data player.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const lines = leaderboard.map((p, i) => {
      const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      return `${medal} ${p.name} - Lv.${p.level} - ${p.gold} Gold`;
    });

    const text =
      alyaHeader("Leaderboard", "🏆") +
      "\n\n" +
      bracketBox("🏆", "ᴛᴏᴘ ᴘʟᴀʏᴇʀ", lines) +
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
