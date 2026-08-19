// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "trivia",
  alias: ["trivia", "tanya", "fact", "fakta"],
  category: "game",
  description: "Jawab fakta umum acak",
  usage: ".trivia",
  example: ".trivia",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

const ITEMS = [
  {
    q: "Apa gunung tertinggi di Indonesia?",
    a: "Puncak Jaya",
  },
  {
    q: "Berapa jumlah provinsi di Indonesia?",
    a: "38",
  },
  {
    q: "Siapa presiden pertama Indonesia?",
    a: "Soekarno",
  },
  {
    q: "Hewan apa yang memiliki jantung terbesar?",
    a: "Paus biru",
  },
  {
    q: "Planet apa yang dikenal sebagai planet merah?",
    a: "Mars",
  },
];

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

    const text =
      alyaHeader("Trivia", "🧠") +
      "\n\n" +
      bracketBox("🧠", "ғᴀᴋᴛᴀ", [
        `◦ Soal: *${item.q}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}trivia untuk soal lain`) +
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
