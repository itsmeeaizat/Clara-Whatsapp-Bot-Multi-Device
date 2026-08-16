import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "jadian",
  alias: ["jadian", "couple", "jodoh", "jadian"],
  category: "fun",
  description: "Cek jodoh kalian berdua",
  usage: ".jadian <@target>",
  example: ".jadian @username",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const MATCH_PHRASES = [
  "❤️ Cinta sejati",
  "💕 Jodoh yang disukai langit",
  "💖 Cocok banget",
  "💗 Ada chemistry-nya",
  "💝 Hubungan yang hangat",
  "💔 Sayangnya kurang cocok",
  "💞 Perlu perbaikan hubungan",
  "💘 Sekuat apapun, tetap sulit",
  "💋 Jodoh tapi...",
  "💌 Hubungan yang harus diperjuangkan",
];

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const targetRaw = m.text?.trim();

    if (!targetRaw) {
      const text =
        alyaHeader("Cara Pakai", "💘") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}jadian <@target>*`,
          `◦ Contoh: *${prefix}jadian @username*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const targetName = targetRaw.replace(/^@+/, "") || targetRaw;
    const actorName = m.pushName || "Kamu";
    const percentage = Math.floor(Math.random() * 100);
    const match = MATCH_PHRASES[Math.floor(Math.random() * MATCH_PHRASES.length)];

    const text =
      alyaHeader("Jadian", "💘") +
      "\n\n" +
      bracketBox("💘", "ʜᴀꜱɪʟ", [
        `◦ ${actorName} + ${targetName}`,
        `◦ Kecocokan: *${percentage}%*`,
        `◦ Status: *${match}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}jadian <@target> untuk cek jodoh lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
