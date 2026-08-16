import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, ensurePlayer, addGold, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "heist",
  alias: ["heist", "rampokbank", "bankraid", "heist"],
  category: "economy",
  description: "Rampok bank dengan risiko tinggi",
  usage: ".heist",
  example: ".heist",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 7200,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const userName = m.pushName || "Player";
    const player = ensurePlayer(m, userName);
    const rpg = player?.rpg || {};

    const roll = Math.random();
    const maxReward = 400;
    const maxPenalty = 250;

    let rewardGold = 0;
    let penaltyGold = 0;
    let result = "";

    if (roll < 0.45) {
      rewardGold = Math.floor(Math.random() * maxReward) + 80;
      result = "Rampokan berhasil!";
    } else if (roll < 0.75) {
      penaltyGold = Math.floor(Math.random() * maxPenalty) + 40;
      result = "Rampokan gagal dan kamu ditilang.";
    } else {
      result = "Keamanan bank menangkapmu, tapi kamu lolos tanpa hukuman.";
    }

    if (rewardGold > 0) addGold(m, rewardGold);
    if (penaltyGold > 0) addGold(m, -penaltyGold);

    const updated = getPlayer(m);
    const updatedRpg = updated?.rpg || {};

    savePlayer(m, {
      rpg: {
        ...updatedRpg,
        gold: updatedRpg.gold ?? rpg.gold ?? 0,
      },
    });

    const lines = [
      `◦ Hasil: *${result}*`,
      rewardGold > 0 ? `◦ Reward: *+${rewardGold} Gold*` : "",
      penaltyGold > 0 ? `◦ Denda: *-${penaltyGold} Gold*` : "",
      `◦ Saldo sekarang: *${updatedRpg.gold ?? rpg.gold ?? 0} Gold*`,
    ].filter(Boolean);

    const text =
      alyaHeader("Heist", "🏦") +
      "\n\n" +
      bracketBox("🏦", "ʜᴀꜱɪʟ", lines) +
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
