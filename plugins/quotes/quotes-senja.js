/**
 * Quotes Senja
 * Usage: .senja
 */

const senja = [
  "Senja selalu cantik kecuali saat kau patah hati.",
  "Aku masih rindu. Namun senja tak ingin lama bertamu.",
  "Ada yang tak tenggelam ketika senja datang, yakni rasa.",
  "Karena senja selalu menerima langit apa adanya.",
  "Setiap senja selalu menjanjikan kita awal yang baru.",
  "Senja telah mengajarkanku apa arti dari mengikhlaskan.",
  "Biar lelah, tapi dia tetap indah. Itulah senja.",
  "Senja tak pernah salah, hanya kenangan yang membuatnya basah.",
  "Hanya senja yang tau cara berpamitan dengan indah.",
  "Senja, perpaduan yang sungguh indah bagi alam semesta.",
  "Selepas senja, aku kembali menjadi manusia yang menutupi air mata dengan gelak tawa.",
  "Senjaku mulai menepi ke peraduannya.",
  "Karena senja tak pernah memintamu menunggu.",
  "Senja mengajariku bahwa indah tak harus abadi.",
  "Di antara senja dan malam, ada jeda untuk bersyukur.",
  "Senja adalah metafora bahwa semua yang indah bisa berakhir.",
  "Ketika senja datang, aku memilih merindukanmu dalam diam.",
  "Senja tidak pernah memilih siapa yang inginnya sedih.",
  "Kita semua seperti senja, datang dan pergi dengan caranya sendiri.",
  "Senja adalah waktu terbaik untuk merevisikan semua kekesalan yang terjadi.",
  "Ada kedamaian dalam senja yang tak bisa dijelaskan kata-kata.",
  "Senja membuatku merasa bahwa hari ini sudah cukup, apapun yang terjadi.",
  "Kalau senja bisa pulang ke langit, kenapa aku tak bisa pulang ke pelukmu?",
  "Senja itu pendek, tapi keindahannya abadi dalam ingatan.",
  "Di ujung senja, aku belajar memaafkan dan melepaskan.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "senja",
  alias: ["katasenja"],
  category: "quotes",
  description: "Random quotes tentang senja",
  usage: ".senja",
  example: ".senja",
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
    await m.reply(pickRandom(senja));
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
