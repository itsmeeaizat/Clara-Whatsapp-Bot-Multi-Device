import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "mathquiz",
  alias: ["mathquiz", "math", "soalmtk", "quizmtk"],
  category: "game",
  description: "Jawab soal matematika acak",
  usage: ".mathquiz",
  example: ".mathquiz",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

function generateMath() {
  const ops = [
    () => {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      return { text: `${a} + ${b} = ?`, answer: a + b };
    },
    () => {
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * 10) + 1;
      return { text: `${a} - ${b} = ?`, answer: a - b };
    },
    () => {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      return { text: `${a} × ${b} = ?`, answer: a * b };
    },
  ];
  return ops[Math.floor(Math.random() * ops.length)]();
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const { text, answer } = generateMath();

    const reply =
      alyaHeader("Math Quiz", "🧮") +
      "\n\n" +
      bracketBox("🧮", "ǫᴜɪᴢ", [
        `◦ Soal: *${text}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}mathquiz untuk soal lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(reply);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const reply =
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

    await m.reply(reply);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
