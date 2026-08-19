// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, ensurePlayer, addGold, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "rob",
  alias: ["rob", "rampok", "gasit", "rob"],
  category: "economy",
  description: "Rampok pemain lain untuk dapat gold",
  usage: ".rob <@target>",
  example: ".rob @username",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3600,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const userName = m.pushName || "Player";
    const targetRaw = m.text?.trim();

    if (!targetRaw) {
      const text =
        alyaHeader("Cara Pakai", "🥷") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}rob <@target>*`,
          `◦ Contoh: *${prefix}rob @username*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const targetName = targetRaw.replace(/^@+/, "") || targetRaw;
    const actor = ensurePlayer(m, userName);
    const actorRpg = actor?.rpg || {};

    if ((actorRpg.gold || 0) < 50) {
      const text =
        alyaHeader("Rob", "🥷") +
        "\n\n" +
        bracketBox("❌", "ɢᴀɢᴀʟ", [
          "◦ Butuh minimal *50 Gold* untuk aksi ini.",
          `◦ Saldo kamu: *${actorRpg.gold || 0} Gold*`,
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

    const roll = Math.random();
    const maxSteal = Math.min(180, Math.floor((actorRpg.gold || 0) * 0.4));
    const penalty = Math.min(120, Math.floor((actorRpg.gold || 0) * 0.25));

    let rewardGold = 0;
    let penaltyGold = 0;
    let result = "";

    if (roll < 0.45) {
      rewardGold = Math.floor(Math.random() * maxSteal) + 20;
      result = `Rampokan ke *${targetName}* berhasil.`;
    } else if (roll < 0.8) {
      penaltyGold = Math.floor(Math.random() * penalty) + 10;
      result = `Rampokan ke *${targetName}* gagal dan kamu ditilang.`;
    } else {
      result = `Kamu nyaris ditangkap saat merampok *${targetName}*.`;
    }

    if (rewardGold > 0) addGold(m, rewardGold);
    if (penaltyGold > 0) addGold(m, -penaltyGold);

    const updated = getPlayer(m);
    const updatedRpg = updated?.rpg || {};

    savePlayer(m, {
      rpg: {
        ...updatedRpg,
        gold: updatedRpg.gold ?? actorRpg.gold ?? 0,
      },
    });

    const lines = [
      `◦ Target: *${targetName}*`,
      `◦ Hasil: *${result}*`,
      rewardGold > 0 ? `◦ Dapat: *+${rewardGold} Gold*` : "",
      penaltyGold > 0 ? `◦ Kehilangan: *-${penaltyGold} Gold*` : "",
      `◦ Saldo sekarang: *${updatedRpg.gold ?? actorRpg.gold ?? 0} Gold*`,
    ].filter(Boolean);

    const text =
      alyaHeader("Rob", "🥷") +
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
