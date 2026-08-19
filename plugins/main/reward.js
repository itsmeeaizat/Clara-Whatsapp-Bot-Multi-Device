// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";
import { ensurePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "reward",
  alias: ["hadiah", "claim", "klaim", "daily", "weeklyreward"],
  category: "economy",
  description: "Klaim hadiah harian/mingguan",
  usage: ".reward",
  example: ".reward",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 86400,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const db = getDatabase();
    const userKey = String(m.sender || m.chat);
    const rewardData = db.get(`reward:${userKey}`) || {};
    const today = new Date().toISOString().slice(0, 10);
    const lastClaim = String(rewardData.date || "");

    if (lastClaim === today) {
      const text =
        alyaHeader("Reward", "🎁") +
        "\n\n" +
        bracketBox("⚠️", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Kamu sudah klaim hadiah hari ini!",
          "◦ Kembali lagi *besok* untuk claim lagi.",
          "◦ Next Claim: *00:00 WIB*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const gold = Math.floor(Math.random() * 500) + 100;
    const exp = Math.floor(Math.random() * 50) + 20;

    const player = ensurePlayer(db, userKey);
    if (player.gold === undefined) player.gold = 0;
    if (player.exp === undefined) player.exp = 0;
    player.gold += gold;
    player.exp += exp;
    db.set(`rpg:${userKey}`, player);

    rewardData.date = today;
    db.set(`reward:${userKey}`, rewardData);

    const text =
      alyaHeader("Hadiah", "🎁") +
      "\n\n" +
      bracketBox("🎁", "ʜᴀꜱɪʟ", [
        `◦ Gold: *+${gold}*`,
        `◦ Exp: *+${exp}*`,
        "◦ Streak: *1 hari*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}reward untuk claim lagi besok`) +
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
