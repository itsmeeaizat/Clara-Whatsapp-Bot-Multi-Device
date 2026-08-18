/**
 * Jadian Putus - Breakup message with dramatic/sad responses
 * Usage: .putus @user
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
  name: "putus",
  alias: ["breakup", "putuspacar"],
  category: "game",
  description: "Putuskan hubungan pacaran dengan pesan dramatis atau sedih",
  usage: ".putus @user",
  example: ".putus @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const DRAMATIC_BREAKUPS = [
  "Maafkan aku... hubungan kita harus berakhir di sini. Kenangan manis kita biarlah menjadi sejarah 💔🌧️",
  "Kita tidak bisa bersama lagi, bukan karena aku tak cinta, tapi karena kita tak lagi searah... Goodbye 🥀🕯️",
  "Sudah cukup sandiwara ini. Aku lelah. Kurelakan kamu bahagia bersama yang lain 🌧️💔",
  "Terima kasih atas semua rasa dan luka. Semoga kamu menemukan seseorang yang lebih baik dariku 🍂👋",
  "Kisah kita memang singkat, tapi rasa sakitnya akan membekas lama. Selamat tinggal... 🥀🩹",
  "Lebih baik kita berpisah sekarang daripada saling menyakiti setiap hari. Maafkan segala salahku 🌧️💧",
];

async function handler(m, { sock }) {
  try {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) {
      const text =
        alyaHeader("Putus Hubungan", "💔") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          "◦ Tag pasangan yang ingin kamu putuskan!",
          "◦ Penggunaan: *.putus @user*",
          "◦ Atau reply pesan pasanganmu",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Setiap pertemuan pasti ada perpisahan...");

      await m.reply(text);
      return { handled: true };
    }

    if (target === m.sender) {
      await m.reply("❌ Kamu tidak bisa memutuskan hubungan dengan dirimu sendiri! 🗿");
      return { handled: true };
    }

    const senderTag = `@${m.sender.split("@")[0]}`;
    const targetTag = `@${target.split("@")[0]}`;
    const message = pickRandom(DRAMATIC_BREAKUPS);

    const text =
      alyaHeader("Perpisahan", "🌧️") +
      "\n\n" +
      bracketBox("💔", "ꜱᴛᴀᴛᴜꜱ ʜᴜʙᴜɴɢᴀɴ", [
        `◦ Pemutus: ${senderTag}`,
        `◦ Mantan: ${targetTag}`,
        "◦ Status: *Resmi Putus!*",
        "",
        `📜 *" ${message} "*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Lagu 'Hati-Hati di Jalan' mulai berputar di latar belakang... 🎶");

    await m.reply(text, { mentions: [m.sender, target] });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
