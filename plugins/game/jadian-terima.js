/**
 * Jadian Terima - Accept a confession
 * Usage: .terima @user
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
  name: "terima",
  alias: ["accept", "terimacinta"],
  category: "game",
  description: "Terima ungkapan cinta dari seseorang",
  usage: ".terima @user",
  example: ".terima @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const SWEET_ACCEPTANCES = [
  "Iya, aku menerima cintamu! Mulai hari ini kita resmi jadian! Jangan pernah tinggalkan aku ya 💕✨",
  "Akhirnya kamu nembak juga! Aku udah nunggu momen ini dari lama. I love you so much! ❤️🌸",
  "Tentu saja aku terima! Bismillah, semoga hubungan kita awet sampai pelaminan 💍💖",
  "Aku mau jadi pasanganmu! Janji ya kita bakal lewati suka dan duka bersama 😘💞",
  "Tanpa ragu sedikit pun... YA, aku mau jadi pacarmu! Jangan lupa traktir temen-temen grup ya 🍰🎉",
];

async function handler(m, { sock }) {
  try {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) {
      const text =
        alyaHeader("Terima Cinta", "💖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          "◦ Tag orang yang cintanya ingin kamu terima!",
          "◦ Penggunaan: *.terima @user*",
          "◦ Atau reply pesan orang tersebut",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Selamat membuka lembaran baru bersama pasanganmu!");

      await m.reply(text);
      return { handled: true };
    }

    if (target === m.sender) {
      await m.reply("❌ Kamu tidak bisa menerima cinta dari dirimu sendiri! 🗿");
      return { handled: true };
    }

    const senderTag = `@${m.sender.split("@")[0]}`;
    const targetTag = `@${target.split("@")[0]}`;
    const message = pickRandom(SWEET_ACCEPTANCES);

    const text =
      alyaHeader("Cinta Diterima", "💑") +
      "\n\n" +
      bracketBox("💖", "ꜱᴛᴀᴛᴜꜱ ʜᴜʙᴜɴɢᴀɴ", [
        `◦ Pasangan: ${senderTag} ❤️ ${targetTag}`,
        "◦ Status: *Resmi Jadian!*",
        "",
        `💌 *" ${message} "*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Selamat atas hubungan kalian yang baru! 🎉");

    await m.reply(text, { mentions: [m.sender, target] });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
