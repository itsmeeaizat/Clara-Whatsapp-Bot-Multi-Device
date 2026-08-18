/**
 * Quotes Kata Bijak
 * Usage: .katabijak
 */

const katabijak = [
  "Keyakinan merupakan suatu pengetahuan di dalam hati, jauh tak terjangkau oleh bukti.",
  "Rasa bahagia dan tak bahagia bukan berasal dari apa yang kamu miliki, bukan pula dari siapa diri kamu, atau apa yang kamu kerjakan. Bahagia dan tak bahagia berasal dari pikiran kamu.",
  "Sakit dalam perjuangan itu hanya sementara. Bisa jadi kamu rasakan dalam semenit, sejam, sehari, atau setahun. Namun jika menyerah, rasa sakit itu akan terasa selamanya.",
  "Hanya seseorang yang takut yang bisa bertindak berani. Tanpa rasa takut itu tidak ada apapun yang bisa disebut berani.",
  "Jadilah diri kamu sendiri. Siapa lagi yang bisa melakukannya lebih baik ketimbang diri kamu sendiri?",
  "Kesempatan kamu untuk sukses di setiap kondisi selalu dapat diukur oleh seberapa besar kepercayaan kamu pada diri sendiri.",
  "Kebanggaan kita yang terbesar adalah bukan tidak pernah gagal, tetapi bangkit kembali setiap kali kita jatuh.",
  "Suatu pekerjaan yang paling tak kunjung bisa diselesaikan adalah pekerjaan yang tak kunjung pernah dimulai.",
  "Pikiran kamu bagaikan api yang perlu dinyalakan, bukan bejana yang menanti untuk diisi.",
  "Kejujuran adalah batu penjuru dari segala kesuksesan. Pengakuan adalah motivasi terkuat. Bahkan kritik dapat membangun rasa percaya diri saat disisipkan di antara pujian.",
  "Segala sesuatu memiliki kesudahan, yang sudah berakhir biarlah berlalu dan yakinlah semua akan baik-baik saja.",
  "Setiap detik sangatlah berharga karena waktu mengetahui banyak hal, termasuk rahasia hati.",
  "Jika kamu tak menemukan buku yang kamu cari di rak, maka tulislah sendiri.",
  "Jika hatimu banyak merasakan sakit, maka belajarlah dari rasa sakit itu untuk tidak memberikan rasa sakit pada orang lain.",
  "Hidup tak selamanya tentang pacar.",
  "Jangan takut gagal. Takutlah jika kamu tidak pernah mencoba.",
  "Sukses bukanlah kunci kebahagiaan. Kebahagiaan adalah kunci sukses.",
  "Jika kamu tidak sanggup menahan lelahnya belajar, maka kamu harus sanggup menahan perihnya kebodohan.",
  "Orang yang paling hebat bukan orang yang tidak pernah gagal, tetapi orang yang tidak pernah menyerah.",
  "Kesalahan adalah bukti bahwa kamu sedang berusaha.",
  "Jangan pernah menghina orang yang sedang berjuang, karena kamu tidak tahu seberapa keras perjuangannya.",
  "Hidup itu sederhana, kita yang sering membuatnya rumit.",
  "Masa lalu tidak bisa diubah, tapi masa depan bisa kamu ciptakan.",
  "Belajar dari kemarin, hidup untuk hari ini, berharap untuk esok hari.",
  "Kebahagiaan tidak datang dari luar, tapi dari dalam diri sendiri.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "katabijak",
  alias: ["quotes", "bijak"],
  category: "quotes",
  description: "Random kata-kata bijak",
  usage: ".katabijak",
  example: ".katabijak",
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
    await m.reply(`"${pickRandom(katabijak)}"`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
