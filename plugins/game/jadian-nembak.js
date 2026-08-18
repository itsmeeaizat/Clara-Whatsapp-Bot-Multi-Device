/**
 * Jadian Nembak - Confession / Propose Game
 * Usage: .nembak @user
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
  name: "nembak",
  alias: ["tembak", "confess"],
  category: "game",
  description: "Ungkapkan perasaan atau nembak seseorang di grup",
  usage: ".nembak @user",
  example: ".nembak @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const CONFESSION_RESULTS = [
  {
    type: "SUCCESS",
    status: "DITERIMA! ❤️🎉",
    message: "Cintamu diterima dengan penuh kehangatan! Selamat, kalian resmi jadian! Minta pajak jadiannya dong 💸✨",
  },
  {
    type: "SUCCESS",
    status: "DITERIMA! 💕🌸",
    message: "Ternyata dia juga suka sama kamu dari dulu! Selamat ya, akhirnya tidak bertepuk sebelah tangan lagi! 😍💌",
  },
  {
    type: "FAIL",
    status: "DITOLAK! 💔🥀",
    message: "Maaf banget, hatinya sudah milik orang lain atau dia belum siap berlayar bersama... Yang sabar ya! 🌧️",
  },
  {
    type: "FAIL",
    status: "DITOLAK SAVAGE! 🗿⚡",
    message: "Dia cuma baca pesanmu lalu tersenyum sinis... 'Kamu bukan tipeku, maap ya.' Kena mental ga tuh! 💥",
  },
  {
    type: "FRIENDZONE",
    status: "FRIENDZONE! 🤡🧸",
    message: "'Kamu terlalu baik buat aku, kita temanan aja ya biar ga canggung.' Sakit tapi tak berdarah! 🩹😭",
  },
  {
    type: "FRIENDZONE",
    status: "BROZONE! 🤝🏻☕",
    message: "'Makasih ya udah confess, tapi aku udah anggap kamu kayak abang/kakak sendiri.' Hadeuh, nasib! 🤦‍♂️",
  },
];

async function handler(m, { sock }) {
  try {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) {
      const text =
        alyaHeader("Nembak / Confess", "💘") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          "◦ Tag orang yang ingin kamu tembak!",
          "◦ Penggunaan: *.nembak @user*",
          "◦ Atau reply pesan orang yang ingin kamu tembak",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Keberanian adalah langkah awal mendapatkan cinta!");

      await m.reply(text);
      return { handled: true };
    }

    if (target === m.sender) {
      await m.reply("❌ Kamu tidak bisa nembak diri sendiri! Cari gebetan lain gih 🗿");
      return { handled: true };
    }

    const senderTag = `@${m.sender.split("@")[0]}`;
    const targetTag = `@${target.split("@")[0]}`;
    const res = pickRandom(CONFESSION_RESULTS);

    const text =
      alyaHeader("Hasil Confess", "💌") +
      "\n\n" +
      bracketBox("💘", "ᴘᴇɴɢᴜɴɢᴋᴀᴘᴀɴ ᴄɪɴᴛᴀ", [
        `◦ Dari: ${senderTag}`,
        `◦ Untuk: ${targetTag}`,
        `◦ Hasil: *${res.status}*`,
        "",
        `💬 *" ${res.message} "*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Gunakan .terima @user atau .tolak @user untuk merespons!");

    await m.reply(text, { mentions: [m.sender, target] });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
