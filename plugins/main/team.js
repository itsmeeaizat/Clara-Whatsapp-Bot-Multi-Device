import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "team",
  alias: ["team", "guild", "klan", "group"],
  category: "game",
  description: "Buat atau kelola tim/guild",
  usage: ".team <nama>",
  example: ".team ClaraSquad",
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
    const name = m.text?.trim();

    if (!name) {
      const text =
        alyaHeader("Cara Pakai", "🛡️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}team <nama>*`,
          `◦ Contoh: *${prefix}team ClaraSquad*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const rpg = db.getUser(m.sender)?.rpg || {};
    const guild = rpg.guild || null;

    if (!guild) {
      db.setUser(m.sender, {
        rpg: { ...rpg, guild: name, rank: rpg.rank || "member" },
      });
    }

    const text =
      alyaHeader("Team", "🛡️") +
      "\n\n" +
      bracketBox("🛡️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Team: *${name}*`,
        `◦ Member: *${m.pushName || m.sender}*`,
        `◦ Role: *${guild ? "anggota" : "leader"}*`,
        "◦ Status: *SUCCESS*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}team <nama> untuk buat team lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
