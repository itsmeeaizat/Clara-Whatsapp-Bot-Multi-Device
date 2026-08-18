/**
 * Quotes Bacot
 * Usage: .bacot
 */

const bacot = [
  "Cuma orang putus aba-aba yang nanya 'apa kamu masih suka aku?'",
  "Cinta tuh seperti kentut, kadang diam-diam tapi baunya terasa.",
  "Kamu itu seperti Wi-Fi, kalau sinyalnya lemah aku auto-disconnect.",
  "Jomblo itu bukan kurang beruntung, tapi sedang dalam masa pengembangan.",
  "Kalau kamu merasa gagal, ingat saja: kamu berhasil membuat orang kecewa.",
  "Jangan suka main sama perasaanku, nanti kamu kena banned.",
  "Hidup itu seperti besi yang dibentuk, kalau bentuknya ganteng ya syukur.",
  "Jangan bersedih, minimal kamu masih bisa bikin orang lain bersedih.",
  "Aku bukan pelangi, aku cuma mau jadi warna di hatimu.",
  "Hidup itu singkat, makan-makan enak dulu sebelum mati.",
  "Kalau kamu pacaran sama aku, aku jamin hidupmu tidak akan membosankan.",
  "Jangan menyerah, karena besok masih ada kesempatan untuk menyerah lagi.",
  "Kamu tuh seperti kuota, selalu habis saat aku paling butuh.",
  "Sibuk itu alasan, kalau aku sibuk pun aku masih sempat mikirin kamu.",
  "Kalau aku jadi kentang, aku mau jadi kentang goreng, biar selalu renyah.",
  "Jangan stress, kalau stress nanti keriput. Kalau keriput nanti susah cari pacar.",
  "Aku itu seperti codingan, kalau error aku bisa di-debug, tapi kalau kamu pergi aku auto-shutdown.",
  "Hidup itu seperti printer, kadang macet di tengah jalan tanpa alasan yang jelas.",
  "Kalau kamu tidak bisa menjadi matahari, jadi kipas angin juga gapapa, asal bisa bikin sejuk.",
  "Kamu itu seperti nitrogen, tidak terlihat tapi bikin hidupku jadi tidak stabil.",
  "Aku bukan boneka, aku bisa di-pause tapi tidak bisa dimainkan.",
  "Kalau kamu merasa tidak berguna, ingat bahwa ada oksigen yang kamu hirup.",
  "Jangan pernah nyesel, kalau nyesel mending beli.jangan kesini.",
  "Cinta itu seperti coding, sekali error terus-terusan debuging.",
  "Kalau hidupmu berat, ya wajar sih. Bayangin hidup kamu atau mati, dua-duanya susah.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "bacot",
  alias: ["bacot"],
  category: "quotes",
  description: "Random quotes bacot/lucu",
  usage: ".bacot",
  example: ".bacot",
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
    await m.reply(pickRandom(bacot));
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
