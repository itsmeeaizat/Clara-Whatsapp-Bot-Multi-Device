import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "claim",
  alias: ["claim", "bounty", "hadiah", "reward"],
  category: "economy",
  description: "Klaim hadiah atau bounty",
  usage: ".claim",
  example: ".claim",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3600,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const bounties = [
      { title: "Kalahkan 10 Slime", reward: "500 Gold + 100 Exp", claimed: false },
      { title: "Kumpulkan 5 Iron", reward: "300 Gold + 50 Exp", claimed: false },
      { title: "Serang Boss", reward: "1000 Gold + 200 Exp", claimed: true },
    ];

    const available = bounties.filter((b) => !b.claimed);

    if (available.length === 0) {
      const text =
        alyaHeader("Claim", "🏆") +
        "\n\n" +
        bracketBox("⚠️", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Tidak ada bounty tersedia saat ini.",
          "◦ Saran: *Selesaikan quest untuk unlock bounty*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Bounty", "🏆") +
      "\n\n" +
      bracketBox("🏆", "ᴛᴇʀꜱᴇᴅɪᴀ", available.map((b) => `◦ ${b.title} - *${b.reward}*`)) +
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
