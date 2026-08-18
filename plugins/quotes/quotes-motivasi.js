/**
 * Quotes Motivasi
 * Random kata-kata motivasi.
 * Usage: .motivasi
 */

const motivasi = [
  "Sukses tidak datang dari apa yang kamu lakukan kadang-kadang, tetapi dari apa yang kamu lakukan secara konsisten.",
  "Jangan pernah takut gagal. Kegagalan adalah bukti bahwa kamu pernah mencoba dan belajar.",
  "Masa depan milik mereka yang percaya pada keindahan mimpi-mimpi mereka.",
  "Pekerjaan hebat tidak dilakukan dengan kekuatan, melainkan dengan ketekunan.",
  "Kamu tidak harus menjadi hebat untuk memulai, tetapi kamu harus memulai untuk menjadi hebat.",
  "Tantangan terbesar dalam hidup adalah melampaui batas diri sendiri.",
  "Jangan menunggu kesempatan datang, ciptakanlah kesempatan itu sendiri.",
  "Setiap langkah kecil yang kamu ambil hari ini mendekatkanmu pada impian besar esok hari.",
  "Keyakinan pada diri sendiri adalah rahasia pertama menuju keberhasilan.",
  "Kesalahan hari ini adalah pelajaran berharga untuk kemenangan esok hari.",
  "Perjalanan ribuan mil selalu dimulai dengan satu langkah pertama.",
  "Ketika kamu merasa ingin menyerah, ingatlah alasan mengapa kamu memulainya.",
  "Kerja keras menembus batas, hasil tidak akan pernah mengkhianati usaha.",
  "Hari ini adalah kesempatan baru untuk menjadi versi terbaik dari dirimu.",
  "Jangan bandingkan prosesmu dengan orang lain, setiap bunga mekar pada waktunya.",
  "Keberanian bukanlah ketiadaan rasa takut, melainkan kemampuan untuk mengalahkannya.",
  "Fokuslah pada solusi, bukan pada hambatan yang ada di depan mata.",
  "Penyesalan terbanyak lahir dari kesempatan yang tidak pernah diambil.",
  "Disiplin adalah jembatan antara cita-cita dan pencapaian.",
  "Mimpi yang besar membutuhkan kerja keras dan kesabaran yang tak terbatas.",
  "Orang yang berhenti belajar akan menjadi pemilik masa lalu, orang yang terus belajar akan menjadi pemilik masa depan.",
  "Tetaplah rendah hati saat di atas, dan tetaplah optimistis saat di bawah.",
  "Rasa sakit yang kamu rasakan hari ini adalah kekuatan yang akan kamu miliki esok hari.",
  "Jangan biarkan suara bising pendapat orang lain membungkam suara hatimu sendiri.",
  "Tujuan hidup adalah bertumbuh, belajar, dan memberikan manfaat bagi sesama.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "motivasi",
  alias: ["motivasi", "motivational"],
  category: "quotes",
  description: "Random kata-kata motivasi",
  usage: ".motivasi",
  example: ".motivasi",
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
    await m.reply(`"${pickRandom(motivasi)}"`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
