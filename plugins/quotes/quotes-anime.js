/**
 * Quotes Anime
 * Random quotes karakter anime.
 * Usage: .quotesanime
 */

const animeQuotes = [
  "\"Kalau kamu tidak suka dengan takdirmu, jangan terima. Berjuanglah untuk mengubahnya!\" - Naruto Uzumaki (Naruto)",
  "\"Orang yang melanggar aturan adalah sampah, tapi orang yang meninggalkan temannya lebih buruk dari sampah.\" - Kakashi Hatake (Naruto)",
  "\"Aku tidak peduli kalau harus mati demi mencapai impianku.\" - Monkey D. Luffy (One Piece)",
  "\"Kalau kamu tidak pernah mencoba, kamu tidak akan pernah tahu hasilnya.\" - Eren Yeager (Attack on Titan)",
  "\"Kekuatan tidak diukur dari seberapa banyak musuh yang kamu kalahkan, tapi seberapa banyak orang yang kamu lindungi.\" - Saitama (One Punch Man)",
  "\"Rasa sakit membuat manusia bertambah kuat dan dewasa.\" - Pain (Naruto Shippuden)",
  "\"Jangan pernah menyerah, karena menyerah adalah awal dari kekalahan sejati.\" - Edward Elric (Fullmetal Alchemist)",
  "\"Ketakutan bukanlah hal yang buruk, itu memberitahu kita apa kelemahan kita.\" - Gildarts Clive (Fairy Tail)",
  "\"Jika kamu memiliki waktu untuk memikirkan akhir yang indah, kenapa tidak hidup indah sampai akhir?\" - Gintoki Sakata (Gintama)",
  "\"Dunia ini tidak sempurna, tapi itulah yang membuatnya indah.\" - Roy Mustang (Fullmetal Alchemist)",
  "\"Impian manusia tidak akan pernah berakhir!\" - Marshall D. Teach (One Piece)",
  "\"Satu-satunya hal yang adil di dunia ini adalah bahwa semua orang tidak diperlakukan secara adil.\" - Light Yagami (Death Note)",
  "\"Lebih baik dipercaya dan dikhianati daripada tidak percaya sama sekali.\" - Kirito (Sword Art Online)",
  "\"Manusia menjadi kuat karena mereka memiliki hal yang ingin dilindungi.\" - Erza Scarlet (Fairy Tail)",
  "\"Jangan menangis karena semuanya telah berakhir, tersenyumlah karena itu pernah terjadi.\" - Levi Ackerman (Attack on Titan)",
  "\"Kemampuan untuk memaafkan adalah salah satu ciri khas manusia sejati.\" - L Lawliet (Death Note)",
  "\"Jalan terpanjang selalu dimulai dengan langkah awal yang penuh keberanian.\" - Tanjiro Kamado (Demon Slayer)",
  "\"Seseorang akan menjadi benar-benar kuat saat dia ingin melindungi orang yang dia cintai.\" - Haku (Naruto)",
  "\"Masa lalu adalah masa lalu, kita tidak bisa terus hidup di dalam bayang-bayangnya.\" - Spike Spiegel (Cowboy Bebop)",
  "\"Tidak ada kebetulan di dunia ini, yang ada hanyalah kepastian.\" - Yuko Ichihara (xxxHOLiC)",
  "\"Kerja keras tidak akan pernah mengkhianatimu, meskipun kadang impian mengkhianatimu.\" - Hachiman Hikigaya (Oregairu)",
  "\"Selama kamu masih bernapas, masih ada harapan untuk mengubah segalanya.\" - Izuku Midoriya (My Hero Academia)",
  "\"Bukan seberapa lama kamu hidup, tapi seberapa berarti hidupmu bagi orang lain.\" - All Might (My Hero Academia)",
  "\"Setiap orang punya masa lalu yang kelam, tapi masa depanmu masih suci.\" - Roronoa Zoro (One Piece)",
  "\"Aku akan terus berjalan maju, sampai semua musuhku hancur!\" - Gojo Satoru (Jujutsu Kaisen)",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "quotesanime",
  alias: ["animequote", "animequote"],
  category: "quotes",
  description: "Random quotes karakter anime",
  usage: ".quotesanime",
  example: ".quotesanime",
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
    await m.reply(pickRandom(animeQuotes));
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
