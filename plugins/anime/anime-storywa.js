/**
 * Story WA Anime Plugin
 * Menampilkan quote anime acak yang diformat untuk Status WhatsApp.
 * Usage: .storywa
 */

const pluginConfig = {
  name: "storywa",
  alias: ["storywa", "wastory"],
  category: "anime",
  description: "Dapatkan quote anime acak untuk Story WhatsApp",
  usage: ".storywa",
  example: ".storywa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const animeQuotes = [
  {
    quote: "Kalau kamu terus membandingkan dirimu dengan orang lain, kamu tidak akan pernah bisa menghargai dirimu sendiri.",
    character: "Kakashi Hatake",
    anime: "Naruto"
  },
  {
    quote: "Impian manusia tidak akan pernah berakhir!",
    character: "Marshall D. Teach",
    anime: "One Piece"
  },
  {
    quote: "Bukan karena kau seorang pahlawan maka kau bertarung, tapi karena kau bertarung maka kau adalah pahlawan.",
    character: "All Might",
    anime: "My Hero Academia"
  },
  {
    quote: "Orang yang tidak bisa mengorbankan sesuatu, tidak akan pernah bisa mengubah apa pun.",
    character: "Armin Arlert",
    anime: "Attack on Titan"
  },
  {
    quote: "Hidup ini bukan tentang menang atau kalah, tapi tentang bagaimana kita bangkit setelah jatuh.",
    character: "Saitama",
    anime: "One Punch Man"
  },
  {
    quote: "Rasa takut bukanlah kelemahan, melainkan kunci untuk menjadi lebih kuat.",
    character: "Gildarts Clive",
    anime: "Fairy Tail"
  },
  {
    quote: "Terkadang kamu harus merasakan sakit untuk tumbuh, gagal untuk tahu, dan kehilangan untuk belajar.",
    character: "Pain / Nagato",
    anime: "Naruto Shippuden"
  },
  {
    quote: "Jangan pernah menyerah pada impianmu, sekecil apa pun kemungkinannya.",
    character: "Tanjiro Kamado",
    anime: "Demon Slayer"
  },
  {
    quote: "Takdir bukanlah sesuatu yang tertulis di atas batu, kita sendiri yang menentukannya.",
    character: "Edward Elric",
    anime: "Fullmetal Alchemist"
  },
  {
    quote: "Senyuman adalah cara terbaik untuk menghadapi setiap masalah dan menyamarkan rasa sakit.",
    character: "Itachi Uchiha",
    anime: "Naruto"
  }
];

async function handler(m) {
  try {
    const randomQuote = animeQuotes[Math.floor(Math.random() * animeQuotes.length)];

    let txt = `📱 *STORY WA ANIME*\n`;
    txt += `━━━━━━━━━━━━━━━━━\n\n`;
    txt += `💬 _"${randomQuote.quote}"_\n\n`;
    txt += `👤 *— ${randomQuote.character}*\n`;
    txt += `🎬 *[ ${randomQuote.anime} ]*\n\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `✨ _Cocok untuk Story WhatsApp kamu!_`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
