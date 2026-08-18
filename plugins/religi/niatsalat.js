/**
 * Niat Sholat
 * ---------------------------------------------------------------
 * Recode dari islamic-niatsholat.js (Zeltoria/Clara-MD).
 * Menampilkan niat sholat 5 waktu dengan teks Arab, latin, dan terjemahan.
 */

const NIAT_DATA = [
  {
    index: 1,
    niat: "Niat Sholat Subuh",
    arabic: "اُصَلِّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    latin: "Ushalli fardhosh shubhi rok'ataini mustaqbilal qiblati adaa-an lillaahi ta'aala",
    translation_id: "Aku berniat shalat fardhu Shubuh dua raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    index: 2,
    niat: "Niat Sholat Dzuhur",
    arabic: "اُصَلِّى فَرْضَ الظُّهْرِاَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    latin: "Ushalli fardhodl dhuhri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    translation_id: "Aku berniat shalat fardhu Dzuhur empat raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    index: 3,
    niat: "Niat Sholat Ashar",
    arabic: "اُصَلِّى فَرْضَ الْعَصْرِاَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    latin: "Ushalli fardhol 'ashri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    translation_id: "Aku berniat shalat fardhu 'Ashar empat raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    index: 4,
    niat: "Niat Sholat Maghrib",
    arabic: "اُصَلِّى فَرْضَ الْمَغْرِبِ ثَلاَثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    latin: "Ushalli fardhol maghribi tsalaata raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    translation_id: "Aku berniat shalat fardhu Maghrib tiga raka'at menghadap kiblat karena Allah Ta'ala",
  },
  {
    index: 5,
    niat: "Niat Sholat Isya",
    arabic: "اُصَلِّى فَرْضَ الْعِشَاءِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
    latin: "Ushalli fardhol 'isyaa-i arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
    translation_id: "Aku berniat shalat fardhu Isya empat raka'at menghadap kiblat karena Allah Ta'ala",
  },
];

const ANJURAN = `\n\nSuatu ibadah akan diterima bila memenuhi dua hal, yaitu niat dan contoh dari rasulullah saw: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ ...[رواه البخاري ومسلم]رَ"
Artinya: "Sesungguhnya (sahnya) amal itu tergantung kepada niat ... [Hadits Riwayat al-Bukhari dan Muslim]."`;

const pluginConfig = {
  name: "niatsalat",
  alias: ["niatsalat", "niatsholat", "niatsolat"],
  category: "religi",
  description: "Menampilkan niat sholat 5 waktu (Subuh, Dzuhur, Ashar, Maghrib, Isya)",
  usage: ".niatsalat",
  example: ".niatsalat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const header = "*「 Niat Sholat 」*\n\n";
  const data = NIAT_DATA.map(
    (v) => `${v.index}. *${v.niat}*\n${v.arabic}\n${v.latin}\n${v.translation_id}`
  ).join("\n\n");

  await m.reply(header + data + ANJURAN);
  return { handled: true };
}

export default { config: pluginConfig, handler };
