import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "couple",
  alias: ["pasangan", "couple", "love", "status", "hubungan"],
  category: "game",
  description: "Lihat status pasangan RPG kamu",
  usage: ".couple",
  example: ".couple",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const db = getDatabase();
    const rpg = db.getUser(m.sender)?.rpg || {};
    const partner = rpg.partner || null;

    if (!partner) {
      const text =
        alyaHeader("Couple", "💑") +
        "\n\n" +
        bracketBox("💔", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Kamu belum memiliki pasangan!",
          "",
          `◦ Cara 1: *${prefix}marry @member*`,
          `◦ Cara 2: *${prefix}propose @member*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Couple", "💑") +
      "\n\n" +
      bracketBox("💑", "ʜᴜʙᴜɴɢᴀɴ", [
        `◦ Kamu: *${m.pushName || "Player"}*`,
        `◦ Pasangan: *${partner}*`,
        `◦ Status: *Married*`,
        "◦ Bonus: *+5% EXP*",
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
