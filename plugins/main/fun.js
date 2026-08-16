import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const COMMANDS = [
  { cmd: ".truth", desc: "Tantangan truth" },
  { cmd: ".tebak", desc: "Tebak angka" },
  { cmd: ".trivia", desc: "Fakta umum" },
  { cmd: ".mathquiz", desc: "Soal matematika" },
  { cmd: ".tebakgambar", desc: "Tebak gambar" },
  { cmd: ".happyemoji", desc: "Emoji ceria" },
];

const pluginConfig = {
  name: "fun",
  alias: ["fun", "funmenu", "games", "main"],
  category: "menu",
  description: "Menu game seru",
  usage: ".fun",
  example: ".fun",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const lines = COMMANDS.map(
      (item) => `${item.cmd} — *${item.desc}*`
    );

    const text =
      alyaHeader("Fun", "🎮") +
      "\n\n" +
      bracketBox("🎮", "ɢᴀᴍᴇ", lines) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}fun untuk lihat menu`) +
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
