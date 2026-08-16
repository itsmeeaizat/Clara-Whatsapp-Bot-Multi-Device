import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, ensurePlayer, addGold, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "daily",
  alias: ["daily", "claim", "dailyreward", "hadiahharian"],
  category: "economy",
  description: "Klaim hadiah gold harian",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 86400,
  energi: 0,
  isEnabled: true,
};

const REWARD = 150;
const BONUS_STREAK = 50;

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const userName = m.pushName || "Player";
    const player = ensurePlayer(m, userName);
    const rpg = player?.rpg || {};
    const lastDaily = rpg?.lastDaily || "";
    const today = getTodayKey();

    if (lastDaily === today) {
      const text =
        alyaHeader("Daily", "🎁") +
        "\n\n" +
        bracketBox("🎁", "ʜᴀʀɪᴀɴ", [
          "◦ Status: *Sudah diklaim hari ini*",
          "◦ Kembali lagi besok ya 😊",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    addGold(m, REWARD);

    const updated = getPlayer(m) || {};
    const updatedRpg = updated?.rpg || {};

    savePlayer(m, {
      rpg: {
        ...updatedRpg,
        lastDaily: today,
      },
    });

    const text =
      alyaHeader("Daily", "🎁") +
      "\n\n" +
      bracketBox("🎁", "ʜᴀꜱɪʟ", [
        `◦ Hadiah: *${REWARD} Gold*`,
        `◦ Saldo sekarang: *${updatedRpg.gold ?? rpg.gold ?? 0} Gold*`,
        "◦ Status: *Berhasil diklaim*",
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
