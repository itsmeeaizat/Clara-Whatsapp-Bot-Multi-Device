import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, addGold, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "upgrade",
  alias: ["upg", "enhance", "tingkatkan", "upgrade"],
  category: "game",
  description: "Upgrade stats RPG kamu",
  usage: ".upgrade <stat>",
  example: ".upgrade atk",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const COSTS = { atk: 200, def: 200, hp: 150, spd: 250 };
const BONUS = { atk: 5, def: 5, hp: 10, spd: 4 };

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const stat = m.text?.trim().toLowerCase();

    if (!stat || !(stat in COSTS)) {
      const text =
        alyaHeader("Cara Pakai", "⬆️") +
        "\n\n" +
        bracketBox("📋", "ᴅᴀꜰᴛᴀʀ ᴜᴘɢʀᴀᴅᴇ", [
          "◦ *ATK* - Upgrade attack - 200 Gold",
          "◦ *DEF* - Upgrade defense - 200 Gold",
          "◦ *HP* - Upgrade health - 150 Gold",
          "◦ *SPD* - Upgrade speed - 250 Gold",
        ]) +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}upgrade <stat>*`,
          `◦ Contoh: *${prefix}upgrade atk*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const cost = COSTS[stat];
    const bonus = BONUS[stat];
    const player = getPlayer(m);
    const gold = player?.gold || 0;

    if (gold < cost) {
      const text =
        alyaHeader("Upgrade", "❌") +
        "\n\n" +
        bracketBox("❌", "ɢᴀɢᴀʟ", [
          `◦ Stat: *${stat.toUpperCase()}*`,
          `◦ Biaya: *${cost} Gold*`,
          `◦ Saldo: *${gold} Gold*`,
          "◦ Status: *Gold tidak cukup*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}daily untuk klaim gold harian`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    addGold(m, -cost);

    const rpg = player?.rpg || {};
    const updated = { ...rpg };

    if (stat === "atk") updated.atk = (updated.atk || 0) + bonus;
    if (stat === "def") updated.def = (updated.def || 0) + bonus;
    if (stat === "hp") updated.hp = (updated.hp || 0) + bonus;
    if (stat === "spd") updated.spd = (updated.spd || 0) + bonus;

    savePlayer(m, { rpg: updated });

    const after = getPlayer(m)?.rpg || {};
    const text =
      alyaHeader("Upgrade", "⬆️") +
      "\n\n" +
      bracketBox("⬆️", "ʜᴀꜱɪʟ", [
        `◦ Stat: *${stat.toUpperCase()}*`,
        `◦ Bonus: *+${bonus}*`,
        `◦ Biaya: *${cost} Gold*`,
        `◦ Sisa Gold: *${after.gold || 0} Gold*`,
        "◦ Status: *Berhasil*",
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
