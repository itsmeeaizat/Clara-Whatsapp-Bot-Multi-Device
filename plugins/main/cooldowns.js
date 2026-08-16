import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "cooldowns",
  alias: ["cd", "cooldown", "wait", "tunggu", "cooldowns"],
  category: "info",
  description: "Cek semua cooldown RPG kamu",
  usage: ".cooldowns",
  example: ".cooldowns",
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
      { name: "Daily", remaining: "12:34:56", status: "READY" },
      { name: "Mine", remaining: "00:45:12", status: "ON COOLDOWN" },
      { name: "Hunt", remaining: "00:15:00", status: "ON COOLDOWN" },
      { name: "Battle", remaining: "00:05:00", status: "ON COOLDOWN" },
      { name: "Dungeon", remaining: "04:20:00", status: "ON COOLDOWN" },
      { name: "Gacha", remaining: "00:00:00", status: "READY" },
    ];

    const text =
      alyaHeader("Cooldowns", "⏱️") +
      "\n\n" +
      bracketBox("⏱️", "ꜱᴋɪʟʟꜱ", cooldowns.map((c) => `◦ ${c.name}: *${c.status} - ${c.remaining}*`)) +
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
