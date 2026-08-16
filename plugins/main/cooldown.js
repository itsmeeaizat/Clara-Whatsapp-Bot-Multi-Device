import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "cooldown",
  alias: ["cd", "cooldown", "wait", "tunggu"],
  category: "info",
  description: "Cek cooldown semua skill RPG",
  usage: ".cooldown",
  example: ".cooldown",
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

    // Placeholder: ganti dengan data cooldown RPG kamu
    const cooldowns = [
      { name: "Daily", remaining: "12:34:56" },
      { name: "Mine", remaining: "00:45:12" },
      { name: "Hunt", remaining: "00:15:00" },
      { name: "Battle", remaining: "00:05:00" },
      { name: "Dungeon", remaining: "04:20:00" },
    ];

    const text =
      alyaHeader("Cooldown", "⏱️") +
      "\n\n" +
      bracketBox("⏱️", "ꜱᴋɪʟʟꜱ", cooldowns.map((c) => `◦ ${c.name}: *${c.remaining}*`)) +
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
