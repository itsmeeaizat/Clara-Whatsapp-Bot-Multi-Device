/**
 * Jadian Cek - Love compatibility percentage check
 * Usage: .cekjadian @user (or reply)
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
  name: "cekjadian",
  alias: ["cekjodoh", "cekcinta"],
  category: "game",
  description: "Cek persentase kecocokan cinta antara dua orang",
  usage: ".cekjadian @user",
  example: ".cekjadian @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const RANGES = [
  {
    min: 0,
    max: 20,
    commentary: [
      "Mending mundur sebelum makin sakit hati 🗿",
      "Chemistry-nya kayak minyak dan air, gak bakal menyatu!",
      "Tingkat kecocokan sangat memprihatinkan... Mending temanan biasa aja.",
      "Zodiak dan takdir kalian tampaknya saling bertabrakan 💥",
    ],
  },
  {
    min: 21,
    max: 40,
    commentary: [
      "Masih butuh mukjizat dan doa malam 🕯️",
      "Kalian lebih cocok jadi musuh dibanding pacar.",
      "Butuh perjuangan ekstra keras kalau mau menyatukan dua hati ini.",
      "Ada peluang sih, tapi tipis banget kayak tisu dibagi dua!",
    ],
  },
  {
    min: 41,
    max: 60,
    commentary: [
      "Lumayan lah, tapi harus banyak mengalah ya! 🤔",
      "Ada potensi, tinggal ditunggu siapa yang ngode duluan.",
      "Hubungan yang cukup seimbang, tergantung niat kalian berdua.",
      "Cocok sebagai teman dekat yang bisa berlanjut ke hubungan serius.",
    ],
  },
  {
    min: 61,
    max: 80,
    commentary: [
      "Cocok banget! Tinggal nunggu restu orang tua 💍",
      "Ada percikan cinta yang makin membara nih!",
      "Chemistry kalian berdua sangat kuat, buruan ditembak sebelum ditikung!",
      "Kalian berdua punya banyak kesamaan yang bikin nyaman ❤️",
    ],
  },
  {
    min: 81,
    max: 100,
    commentary: [
      "Pasangan sempurna! Buruan bawa ke pelaminan! ❤️🔥",
      "Takdir sudah menggariskan kalian bersama forever!",
      "Kombinasi luar biasa! Belum jadian aja udah bikin orang iri 😍✨",
      "100% Match! Bagaikan Adam dan Hawa yang dipertemukan kembali! 🎉",
    ],
  },
];

async function handler(m, { sock }) {
  try {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) {
      const text =
        alyaHeader("Cek Kecocokan", "💘") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          "◦ Tag orang yang ingin kamu cek kecocokannya!",
          "◦ Penggunaan: *.cekjadian @user*",
          "◦ Atau reply pesan orang tersebut",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Cek seberapa besar takdir cinta kalian berdua!");

      await m.reply(text);
      return { handled: true };
    }

    const percentage = Math.floor(Math.random() * 101);
    const matchedRange = RANGES.find((r) => percentage >= r.min && percentage <= r.max) || RANGES[0];
    const comment = pickRandom(matchedRange.commentary);

    const senderTag = `@${m.sender.split("@")[0]}`;
    const targetTag = `@${target.split("@")[0]}`;

    const text =
      alyaHeader("Kecocokan Cinta", "🔮") +
      "\n\n" +
      bracketBox("💖", "ʜᴀsɪʟ ᴀɴᴀʟɪsɪs", [
        `◦ Pasangan: ${senderTag} x ${targetTag}`,
        `◦ Kecocokan: *${percentage}%*`,
        "",
        `📝 *" ${comment} "*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Hasil ini hanya untuk hiburan semata!");

    await m.reply(text, { mentions: [m.sender, target] });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
