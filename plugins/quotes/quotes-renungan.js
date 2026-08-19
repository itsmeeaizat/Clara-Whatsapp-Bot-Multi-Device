// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Quotes Renungan
 * Random kata-kata renungan kehidupan.
 * Usage: .renungan
 */

const renungan = [
  "Hidup ini sangat singkat, jangan dihabiskan untuk membenci hal-hal yang tidak penting.",
  "Banyak orang sibuk mengejar dunia, sampai lupa bahwa yang abadi adalah akhirat.",
  "Harta yang paling berharga bukanlah yang kita simpan, melainkan yang kita bagikan.",
  "Sebelum menyalahkan keadaan, cobalah untuk merenungi perbuatan diri sendiri.",
  "Kesederhanaan adalah kunci kedamaian hati yang tidak bisa dibeli dengan uang.",
  "Terkadang sepi adalah cara alam mengingatkan kita untuk kembali pada diri sendiri.",
  "Bersyukurlah atas apa yang kamu miliki hari ini, sebab banyak yang mendambakan posisimu.",
  "Jangan jadikan pujian membuatmu sombong, dan cataan membuatmu jatuh.",
  "Napas yang kita hirup hari ini adalah anugerah yang belum tentu kita dapatkan besok.",
  "Memaafkan bukan untuk mengubah masa lalu, melainkan untuk melapangkan masa depan.",
  "Kebaikan sekecil apapun tidak akan pernah sia-sia di mata Sang Pencipta.",
  "Jangan terlalu mengejar kesempurnaan, karena keindahan terletak pada keikhlasan menerima.",
  "Setiap masalah hadir membawa pesan dan pelajaran berharga bagi kedewasaan jiwa.",
  "Ketenangan hati hadir ketika kita berhenti membandingkan hidup kita dengan orang lain.",
  "Kebahagiaan sejati tidak ditemukan di luar, melainkan terbit dari rasa syukur di dalam dada.",
  "Di balik setiap cobaan yang berat, selalu ada hikmah indah yang menanti.",
  "Hati yang penuh amarah tidak akan pernah merasakan manisnya kedamaian.",
  "Jangan menunggu waktu yang tepat untuk berbuat baik, karena waktu tidak pernah menunggu.",
  "Manusia terbaik adalah yang paling banyak memberikan manfaat bagi sesamanya.",
  "Ketika kamu lelah, beristirahatlah, bukan menyerah dari jalan kebaikan.",
  "Senyum tulus adalah sedekah termudah yang bisa mencerahkan hari orang lain.",
  "Dunia ini hanyalah tempat persinggahan sementara, persiapkan bekal sebaik mungkin.",
  "Penyesalan terdalam lahir ketika kita menunda kebaikan yang seharusnya dilakukan hari ini.",
  "Bicaralah yang baik atau diamlah, karena lidah bisa menorehkan luka yang tak terlihat.",
  "Kehidupan yang jujur dan bersahaja jauh lebih indah daripada kemewahan yang palsu.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "renungan",
  alias: ["renungan"],
  category: "quotes",
  description: "Random kata-kata renungan kehidupan",
  usage: ".renungan",
  example: ".renungan",
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
    await m.reply(`"${pickRandom(renungan)}"`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
