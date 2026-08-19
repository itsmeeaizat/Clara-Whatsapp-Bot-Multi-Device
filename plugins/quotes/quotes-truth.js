// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Quotes Truth (Kejujuran)
 * Usage: .truth
 */

const truth = [
  "Siapa orang yang paling sering kamu pikirkan akhir-akhir ini?",
  "Apa rahasia yang belum pernah kamu ceritakan ke siapapun?",
  "Siapa orang yang diam-diam kamu sukai tapi tidak berani bilang?",
  "Apa hal paling memalukan yang pernah kamu lakukan?",
  "Kapan terakhir kamu menangis dan kenapa?",
  "Apa hal yang paling kamu sesali dalam hidup?",
  "Siapa orang yang paling kamu cemburai?",
  "Apa ketakutan terbesarmu yang belum pernah kamu ceritakan?",
  "Hal apa yang paling sering kamu lakukan saat sendirian?",
  "Siapa orang yang paling berpengaruh dalam hidupmu?",
  "Apa hal paling bodoh yang pernah kamu lakukan karena cinta?",
  "Kapan terakhir kamu berbohong dan untuk apa?",
  "Apa kebiasaan buruk yang sampai sekarang belum bisa kamu tinggalkan?",
  "Siapa orang yang paling kamu benci tapi tidak pernah kamu tunjukkan?",
  "Apa yang akan kamu lakukan kalau dunia kiamat besok?",
  "Siapa orang yang paling menyebalkan menurutmu di sekitar kamu?",
  "Apa hal yang paling kamu banggakan dari dirimu?",
  "Kapan terakhir kamu merasa benar-benar bahagia?",
  "Apa hal yang kamu sembunyikan dari orang tuamu?",
  "Siapa teman yang paling sering kamu khianati (backstabbing)?",
  "Apa maaf yang sebenarnya belum kamu berikan ke seseorang?",
  "Kalau kamu bisa kembali ke masa lalu, momen apa yang ingin kamu ulangi?",
  "Apa hal tentang dirimu yang paling tidak kamu suka?",
  "Siapa orang yang menurutmu paling hipokrit di sekitar kamu?",
  "Apa hal paling ngena yang pernah dikatakan seseorang ke kamu?",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "truth",
  alias: ["kejujuran"],
  category: "quotes",
  description: "Random truth / pertanyaan jujur",
  usage: ".truth",
  example: ".truth",
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
    await m.reply(`*🤔 Truth*\n\n${pickRandom(truth)}`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
