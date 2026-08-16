import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, ensurePlayer, addGold, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "crime",
  alias: ["crime", "kriminal", "curi", "crime"],
  category: "economy",
  description: "Lakukan aksi kriminal untuk dapat gold",
  usage: ".crime",
  example: ".crime",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 1800,
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
    const maxReward = 220;
    const maxPenalty = 180;

    let rewardGold = 0;
    let penaltyGold = 0;
    let result = "";

    if (roll < 0.4) {
      rewardGold = Math.floor(Math.random() * maxReward) + 40;
      result = "Aksi kriminal berhasil.";
    } else if (roll < 0.7) {
      penaltyGold = Math.floor(Math.random() * maxPenalty) + 20;
      result = "Aksi kriminal gagal dan kamu ditilang.";
    } else {
      result = "Kamu nyaris tertangkap, tapi berhasil lolos.";
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
      alyaHeader("Crime", "🥷") +
      "\n\n" +
      bracketBox("🥷", "ʜᴀꜱɪʟ", lines) +
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
