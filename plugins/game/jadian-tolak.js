/**
 * Jadian Tolak - Reject a confession (funny / savage)
 * Usage: .tolak @user
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "tolak",
  alias: ["reject", "tolakcinta"],
  category: "game",
  description: "Tolak ungkapan cinta dari seseorang dengan kalimat lucu/savage",
  usage: ".tolak @user",
  example: ".tolak @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const SAVAGE_REJECTIONS = [
  "Maaf ya, muka kamu standar, sedangkan selera aku internasional 💅🏻✨",
  "Kamu terlalu baik buat aku, dan aku terlalu jahat buat makhluk seindah kamu... Gak nyambung kan? Ya emang sengaja nolak 🗿",
  "Bukannya mau nolak, tapi muka kamu mirip banget sama mantan pacar kucingku 😼🔥",
  "Aduh maap, sinyal hatiku lagi terputus untukmu. Coba hubungi 100 tahun lagi ya! 📡❌",
  "Aku menghargai keberanianmu, tapi standar jodohku minimal bisa mengendalikan 4 elemen 🌊🔥🍃🪨",
  "Maaf, saat ini aku sedang fokus mengejar cita-cita, bukan mengejar harapan palsumu 🚀👋",
  "Kita temenan aja ya... temenan tanpa sapa, tanpa temu, dan tanpa rasa 😉💬",
];

async function handler(m, { sock }) {
  try {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) {
      const text =
        alyaHeader("Tolak Cinta", "💔") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          "◦ Tag orang yang cintanya ingin kamu tolak!",
          "◦ Penggunaan: *.tolak @user*",
          "◦ Atau reply pesan orang tersebut",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Tolaklah dengan tegas tapi tetap menghibur!");

      await m.reply(text);
      return { handled: true };
    }

    if (target === m.sender) {
      await m.reply("❌ Masa menolak diri sendiri? Hati-hati krisis identitas 🗿");
      return { handled: true };
    }

    const senderTag = `@${m.sender.split("@")[0]}`;
    const targetTag = `@${target.split("@")[0]}`;
    const message = pickRandom(SAVAGE_REJECTIONS);

    const text =
      alyaHeader("Penolakan Cinta", "⚡") +
      "\n\n" +
      bracketBox("💔", "ʜᴀsɪʟ ᴘᴇɴᴏʟᴀᴋᴀɴ", [
        `◦ Penolak: ${senderTag}`,
        `◦ Korban: ${targetTag}`,
        "◦ Status: *Ditolak Mentah-Mentah!*",
        "",
        `🗣️ *" ${message} "*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Tetap semangat! Masih banyak ikan di lautan 🐟🌊");

    await m.reply(text, { mentions: [m.sender, target] });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
