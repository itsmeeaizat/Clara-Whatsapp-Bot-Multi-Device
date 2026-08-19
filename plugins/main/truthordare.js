// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "truthordare",
  alias: ["truthordare", "tod", "truth", "dare"],
  category: "game",
  description: "Main Truth or Dare",
  usage: ".truthordare",
  example: ".truthordare",
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
    const roll = Math.random();
    const isTruth = roll < 0.5;
    const truthQuestions = [
      "Apa rahasia terbesar yang pernah kamu simpan?",
      "Siapa orang yang kamu sukai saat ini?",
      "Apa hal paling memalukan yang pernah terjadi?",
    ];
    const dareQuestions = [
      "Kirim voice note bernyanyi.",
      "Chat crush kamu sekarang.",
      "Post foto terbaru kamu di story.",
    ];
    const question = isTruth
      ? truthQuestions[Math.floor(Math.random() * truthQuestions.length)]
      : dareQuestions[Math.floor(Math.random() * dareQuestions.length)];
    const type = isTruth ? "Truth" : "Dare";

    const text =
      alyaHeader("Truth or Dare", "🎲") +
      "\n\n" +
      bracketBox("🎲", "ᴛᴏᴅ", [
        `◦ Tipe: *${type}*`,
        `◦ Tantangan: *${question}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}truthordare untuk main lagi`) +
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
