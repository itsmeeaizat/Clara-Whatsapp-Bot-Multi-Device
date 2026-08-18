/**
 * Quotes Islamic
 * Usage: .qislam
 */

const islam = [
  "Allah tidak pernah tertidur. Apa yang membuatmu mengira Dia lupa padamu?",
  "Bersabarlah. Allah sedang menyiapkan yang terbaik untukmu.",
  "Jangan takut dengan masa depan, takutlah kepada Allah saja.",
  "Setiap detik yang kamu habiskan untuk mengingat Allah adalah investasi terbaik.",
  "Hati yang tenang adalah hati yang selalu mengingat Allah.",
  "Allah tidak membebani seseorang kecuali sesuai dengan kesanggupannya.",
  "Sesungguhnya bersama kesulitan ada kemudahan.",
  "Tidak ada yang tak mungkin bagi Allah. Jangan pernah berhapa berdoa.",
  "Jadilah seperti pohon yang lebat buahnya, walau dilempari batu tetap membalas dengan buah.",
  "Jangan pernah mengeluh, karena setiap yang terjadi adalah atas izin Allah.",
  "Bersyukur adalah kunci kebahagiaan yang tak terbatas.",
  "Dunia ini sementara, akhirat itu kekal. Beramallah untuk yang kekal.",
  "Hidup ini hanyalah perjalanan, jangan jadikan dunia sebagai tujuan akhir.",
  "Ikhlas adalah kunci diterimanya amal ibadah.",
  "Bersedekahlah walau sedikit, karena sedekah bisa memperpanjang umur.",
  "Allah Maha Baik, Dia tahu apa yang terbaik untukmu, bahkan ketika kamu tidak tahu.",
  "Shalat adalah tiang agama. Jangan tinggalkan shalat walau apapun yang terjadi.",
  "Bersabar atas musibah itu akan menghapus dosa.",
  "Tinggalkan yang meragukan menuju yang tidak meragukan.",
  "Baca Al-Quran, karena ia adalah cahaya hati yang redup.",
  "Jangan pernah putus asa dari rahmat Allah, sesungguhnya Allah Maha Pengampun.",
  "Ingat mati, maka dunia akan terasa kecil di matamu.",
  "Doa adalah senjata orang mukmin.",
  "Cintai Allah, nanti Allah akan mencintaimu.",
  "Berdoalah dengan yakin bahwa Allah akan menjawab.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "qislam",
  alias: ["q-islam", "quotesislam"],
  category: "quotes",
  description: "Random quotes islami",
  usage: ".qislam",
  example: ".qislam",
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
    await m.reply(`"${pickRandom(islam)}"`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
