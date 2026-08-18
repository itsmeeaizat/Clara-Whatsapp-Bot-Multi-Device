/**
 * Quotes Gombal
 * Random kata-kata gombal / pickup lines.
 * Usage: .gombal
 */

const gombal = [
  "Kamu tahu gak bedanya kamu sama kipas? Kipas bikin angin, kalau kamu bikin kangen.",
  "Aku tanpa kamu tuh bagaikan ambulan tanpa 'wiwuwewu'.",
  "Kalau kamu jadi senar gitar, aku gak mau jadi gitarisnya. Karena aku gak mau mutusin kamu.",
  "Kamu punya peta gak? Soalnya aku tersesat di dalam hatimu.",
  "Bintang di langit indah ya, tapi masih kalah indah sama senyuman kamu.",
  "Aku gak butuh kacamata minus, soalnya fokus mataku cuma ke kamu.",
  "Kamu tahu kenapa air laut rasanya asin? Karena manisnya udah diborong sama kamu.",
  "Aku mau komplain ke polisi, soalnya kamu udah mencuri hatiku tanpa izin.",
  "Boleh minta foto kamu? Aku mau tunjukin ke mamaku kalau jodohku sudah ketemu.",
  "Kamu itu kayak kopi hangat di pagi hari, selalu bikin hariku makin bersemangat.",
  "Kalau disuruh memilih antara bernapas dan mencintaimu, aku pilih napas terakhir untuk bilang 'I love you'.",
  "Kamu capek gak? Padahal kamu lari-lari terus di pikiranku seharian.",
  "Masa lalu adalah kenangan, masa depan adalah harapan, dan kamu adalah kenyataan terindah.",
  "Aku tidak pernah percaya cinta pada pandangan pertama, sampai akhirnya aku melihatmu.",
  "Tolong jangan senyum terus, nanti gula darahku naik lihat manisnya kamu.",
  "Rumah apa yang paling indah? Rumah tangga kita berdua nanti.",
  "Kamu tahu bedanya kamu sama pensil? Pensil mewarnai kertas, kamu mewarnai hariku.",
  "Aku gak bisa nyanyi, tapi kalau disuruh menyanyikan lagu tentang cinta kita, aku siap.",
  "Kamu itu seperti alarm, selalu bangunkan rasa cintaku tiap kali kamu tersenum.",
  "Bukan hanya kopi yang bikin ketagihan, memikirkanmu juga bikin aku kecanduan.",
  "Satu tambah satu sama dengan dua, tapi kalau aku tambah kamu sama dengan bahagia.",
  "Kalau kamu jadi air mata, aku gak mau menangis. Soalnya aku takut kehilangan kamu.",
  "Bumi ini berputar pada porosnya, tapi hatiku cuma berputar di sekitar kamu.",
  "Jalan-jalan ke Jakarta beli selasih, cukup sekian wahai kekasih, cintaku takkan pernah habis.",
  "Pagi-pagi minum teh hangat, lihat kamu langsung bikin semangat.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "gombal",
  alias: ["gombal"],
  category: "quotes",
  description: "Random kata-kata gombal / pickup lines",
  usage: ".gombal",
  example: ".gombal",
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
    await m.reply(`"${pickRandom(gombal)}"`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
