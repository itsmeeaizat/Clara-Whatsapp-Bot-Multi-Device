import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "explore",
  alias: ["explore", "eksplor", "petualangan", "travel", "adventure"],
  category: "game",
  description: "Jelajahi dunia dan dapat hadiah",
  usage: ".explore",
  example: ".explore",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 300,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    // Placeholder: ganti dengan logic explore RPG kamu
    const outcomes = [
      { text: "Kamu menemukan chest!", gold: 200, exp: 50 },
      { text: "Kamu bertemu monster!", gold: -50, exp: 20 },
      { text: "Kamu menemukan artifact langka!", gold: 500, exp: 100 },
      { text: "Kamu tersesat di hutan...", gold: 0, exp: 10 },
      { text: "Kamu bertemu pemandu!", gold: 100, exp: 30 },
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    const text =
      alyaHeader("Explore", "🗺️") +
      "\n\n" +
      bracketBox("🗺️", "ʜᴀꜱɪʟ", [
        `◦ Hasil: *${outcome.text}*`,
        `◦ Gold: *${outcome.gold >= 0 ? "+" : ""}${outcome.gold}*`,
        `◦ Exp: *+${outcome.exp}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}explore untuk jelajahi lagi`) +
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
