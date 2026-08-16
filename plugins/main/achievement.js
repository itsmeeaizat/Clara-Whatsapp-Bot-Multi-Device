import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "achievement",
  alias: ["achieve", "prestasi", "achievement", "medal"],
  category: "game",
  description: "Lihat Achievement RPG kamu",
  usage: ".achievement",
  example: ".achievement",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const unlocked = [
      "First Blood - Kalahkan monster pertama",
      "Rich - Kumpulkan 10.000 Gold",
      "Veteran - Main 30 hari",
    ];

    const locked = [
      "Dragon Slayer - Kalahkan boss naga",
      "Collector - Kumpulkan 50 item",
      "Marathon - Main 100 hari",
    ];

    const text =
      alyaHeader("Achievement", "🏆") +
      "\n\n" +
      bracketBox("🏆", "ꜱᴛᴀᴛɪꜱᴛɪᴋ", [
        `◦ Unlocked: *${unlocked.length}*`,
        `◦ Locked: *${locked.length}*`,
        `◦ Total: *${unlocked.length + locked.length}*`,
      ]) +
      "\n\n" +
      bracketBox("✅", "ᴜɴʟᴏᴄᴋᴇᴅ", unlocked.map((a) => `◦ ${a}`)) +
      "\n\n" +
      bracketBox("🔒", "ʟᴏᴄᴋᴇᴅ", locked.map((a) => `◦ ${a}`)) +
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
