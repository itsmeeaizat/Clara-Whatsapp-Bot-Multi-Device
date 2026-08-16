import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const TRUTHS = [
  "Apa rahasia yang belum kamu ceritakan kepada siapa pun?",
  "Siapa orang yang paling sering kamu pikirkan akhir-akhir ini?",
  "Apa kebiasaan aneh yang kamu miliki?",
];

const pluginConfig = {
  name: "truth",
  alias: ["truth", "truthordare", "jujur"],
  category: "game",
  description: "Tantangan truth acak",
  usage: ".truth",
  example: ".truth",
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
    const truth = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];

    const text =
      alyaHeader("Truth", "🎯") +
      "\n\n" +
      bracketBox("🎯", "ᴛʀᴜᴛʜ", [
        `◦ Tantangan: *${truth}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}truth untuk tantangan lain`) +
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
