// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Quotes Galau
 * Usage: .galauquotes
 */

const galau = [
  "Kadang aku merasa, sebenarnya bukan kamu yang aku rindukan, tapi kenangan bersamamu.",
  "Aku belajar mengikhlaskan bukan karena aku kuat, tapi karena aku capek menunggu.",
  "Terkadang orang yang paling kamu cintai adalah orang yang paling sulit untuk kamu miliki.",
  "Kesedihan terdalam adalah ketika kamu menyadari bahwa kamu tidak ada di pikiran orang yang selalu kamu pikirkan.",
  "Aku tidak tahu mana yang lebih menyakitkan: menunggu atau menyadari bahwa tidak ada gunanya menunggu.",
  "Kadang aku berharap kita tidak pernah bertemu, supaya aku tidak tahu rasanya kehilangan.",
  "Jarak tidak menyatukan, jarak mengajarkan siapa yang benar-benar bertahan.",
  "Aku diam bukan karena tidak punya kata-kata, tapi karena kata-kata tidak cukup untuk menggambarkan rasa ini.",
  "Seseorang pernah bilang, kalau kamu merindukan seseorang, biarkan saja. Tapi kalau sakitnya tidak hilang, belajarlah melepaskan.",
  "Aku menulis bukan karena pintar, tapi karena ada perasaan yang tidak bisa diucapkan.",
  "Pernah merasa sendiri di tengah keramaian? Itu lebih menyedihkan daripada benar-benar sendirian.",
  "Kamu bilang kamu baik-baik saja, tapi matamu mengatakan hal lain.",
  "Menerima kenyataan itu pahit, tapi menyangkalnya lebih menyiksa.",
  "Aku pensil, kamu penghapus. Kita selalu bersama tapi tak pernah selesai.",
  "Cinta yang tersisa hanyalah kenangan, dan kenangan itu kadang lebih sakit daripada kehilangan.",
  "Aku tidak menyerah untuk mencintaimu, aku hanya belajar menerima bahwa kamu bukan untukku.",
  "Kadang yang paling aku takuti bukan kehilanganmu, tapi melihatmu bahagia dengan orang lain.",
  "Hari ini aku merindukanmu lebih dari kemarin, tapi tidak sebanyak besok.",
  "Mengikhlaskan bukan berarti melupakan, tapi membiarkan rasa itu ada tanpa mengharapkan.",
  "Aku berharap kamu membaca pesan ini, tapi aku tahu kamu tidak akan pernah peduli.",
  "Rindu itu aneh. Datang tiba-tiba, pergi tidak pernah.",
  "Kalau aku bisa memilih, aku akan memilih untuk tidak pernah mengenalmu. Tapi karena sudah mengenal, aku tidak bisa melupakan.",
  "Diamku bukan lupa, tapi aku sedang belajar menerima bahwa kamu sudah tidak ada.",
  "Aku tersenyum bukan karena bahagia, tapi karena kalau aku tidak tersenyum, aku akan menangis.",
  "Galau itu seperti hujan, datang tanpa diundang dan pergi tanpa pamit.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "galauquotes",
  alias: ["quotesgalau"],
  category: "quotes",
  description: "Random quotes galau",
  usage: ".galauquotes",
  example: ".galauquotes",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  try {
    await m.reply(`"${pickRandom(galau)}"`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
