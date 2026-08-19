// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "rules",
  alias: ["rules", "rule", "aturan", "rules"],
  category: "group",
  description: "Lihat aturan grup",
  usage: ".rules",
  example: ".rules",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const RULES = [
  "1. Hormati anggota grup.",
  "2. Dilarang spam.",
  "3. Dilarang konten SARA/NSFW.",
  "4. Gunakan bot dengan bijak.",
  "5. Patuhi perintah admin.",
];

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const text =
      alyaHeader("Rules", "📜") +
      "\n\n" +
      bracketBox("📜", "ᴀᴛᴜʀᴀɴ", RULES) +
      "\n\n" +
      separator() +
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
