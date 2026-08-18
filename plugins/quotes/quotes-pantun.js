/**
 * Quotes Pantun
 * Usage: .pantun
 */

const pantun = [
  "Jalan-jalan ke kota blitar\nMampir beli rambutan dulu\nJangan suka mencuri\nNanti kamu ditangkap polisi",
  "Burung merpati terbang melayang\nHinggap sebentar di atas pagar\nJangan suka mencuri\nNanti dicari polisi",
  "Ke pasar membeli roti\nRoti di tangan sudah jadi\nPagi-pagi mandi dulu\nKalau tidak, badan bau nanti",
  "Bunga mawar harum baunya\nBunga melati putih warnanya\nKalau kamu rajin belajar\nPasti nilai kamu bagus",
  "Burung pipit hinggap di kabel\nKabelnya putus karena sudah tua\nKalau kamu rajin belajar\nPasti kamu akan jadi orang sukses",
  "Makan sirih bersama kawan\nSirih datang dari kampung seberang\nJanganlah kita suka bertengkar\nKarena itu perbuatan tercela",
  "Pergi ke sawah menanam padi\nPadi dipanen dibawa ke rumah\nJadilah anak yang berbakti\nKepada kedua orang tuamu",
  "Beli buah di pasaran\nPasaran ramai dikunjungi orang\nKalau kamu mau jadi orang baik\nJangan suka berbohong",
  "Anak ayam turun sepuluh\nMati satu tinggal sembilan\nKalau kamu mau sukses\nJangan suka menyerah",
  "Bunga melati di taman bunga\nBunga mawar di taman raja\nKalau kamu mau sehat\nJangan lupa rajin olahraga",
  "Ke hutan mencari kayu\nKayu dibawa pulang ke rumah\nJadilah anak yang sopan\nKepada orang yang lebih tua",
  "Pergi ke laut mencari ikan\nIkan banyak di dalam jaring\nJadilah orang yang jujur\nJangan suka berbohong",
  "Buah nanas buah duren\nDuren jatuh ke tanah\nJangan suka marah-marah\nNanti kamu tidak punya teman",
  "Kupu-kupu terbang di taman\nTaman bunga indah dilihat\nKalau kamu mau pintar\nRajin belajar jangan malas",
  "Jalan ke kota madya\nMadya di kota jakarta\nJangan suka menunda\nPekerjaan kalau bisa sekarang",
  "Matahari terbit di pagi hari\nMalam hari menghilang\nJangan suka menganiaya\nSesama makhluk tuhan",
  "Pergi ke sungai mencari ikan\nIkan lele banyak di sungai\nKalau kamu mau sehat\nJangan lupa makan teratur",
  "Bunga kenanga di taman\nTaman bunga wanginya semerbak\nJadilah orang yang sabar\nDalam menghadapi cobaan",
  "Ke gunung membawa bekal\nBekal habis di tengah jalan\nKalau kamu mau berhasil\nJangan suka mengeluh",
  "Beli gula di warung\nWarung dekat dengan rumah\nKalau kamu mau bahagia\nJangan suka iri hati",
  "Pohon kelapa tumbuh di tepi pantai\nBuahnya bisa dijadikan minuman\nJadilah orang yang rendah hati\nJangan sombong atas apa yang kamu punya",
  "Kupu-kupu terbang di kebun\nKebun penuh bunga melati\nJadilah orang yang tekun\nDalam belajar dan bekerja",
  "Ikan lele di dalam kolam\nKolam dalam airnya jernih\nJadilah anak yang rendah hati\nJangan sombong karena kekayaan",
  "Pergi ke kebun memetik mangga\nMangga matang rasanya manis\nJadilah orang yang bermutu\nWalau tidak punya harta",
  "Bunga sunwar bunga kenanga\nSemerbak harum baunya\nJadilah pribadi yang sopan\nAgar disayang semua orang",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "pantun",
  alias: ["pantun"],
  category: "quotes",
  description: "Random pantun",
  usage: ".pantun",
  example: ".pantun",
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
    await m.reply(pickRandom(pantun));
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
