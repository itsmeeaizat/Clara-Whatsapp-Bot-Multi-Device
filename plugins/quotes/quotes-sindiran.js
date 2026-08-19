// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Quotes Sindiran
 * Random kata-kata sindiran / roast.
 * Usage: .sindiran
 */

const sindiran = [
  "Sifatmu kayak cermin tua, buram dan penuh retakan.",
  "Bicara manis di depan, di belakang nusuknya pakai tombak.",
  "Terima kasih sudah mengajarkanku bahwa tidak semua manusia punya ketulusan.",
  "Janji kamu itu ibarat kuota gratisan, cepat banget habisnya.",
  "Orang sombong biasanya lupa kalau tanah yang diinjaknya bakal jadi rumah terakhirnya.",
  "Lucu ya, dateng pas ada butuhnya, pergi pas udah senangnya.",
  "Gaya selangit, tapi isi dompet dan otak sama-sama kosong.",
  "Bukan tidak mau membalas, hanya tidak ingin menurunkan level diri ke tingkatmu.",
  "Tolong mukanya dikondisikan, jangan kebanyakan drama.",
  "Punya dua muka tapi gak satupun yang kelihatan jujur.",
  "Jangan sok pahlawan kalau diri sendiri aja masih jadi beban keluarga.",
  "Otak kamu ibarat memori 16GB, dikit-dikit udah penuh rasa egois.",
  "Sudah salah, galak, berisik lagi. Kombinasi yang sangat sempurna.",
  "Pura-pura peduli itu capek lho, mending jujur aja kalau memang tidak suka.",
  "Suka mengkritik orang lain, tapi alpa melihat cermin di rumah.",
  "Datang bagai pahlawan, pergi bagai penjahat. Klasik sekali.",
  "Bicaramu tinggi sekali, awas tersangkut kabel listrik.",
  "Teman sejati itu merangkul, bukan memukul dari belakang.",
  "Mungkin kamu butuh kaca yang lebih besar supaya bisa lihat kelakuan sendiri.",
  "Sok sibuk padahal cuma bingung mau ngapain.",
  "Mending diam daripada ngomong tapi isinya cuma omong kosong.",
  "Lupa daratan boleh, tapi jangan sampai lupa cara jadi manusia.",
  "Hargai orang lain kalau ingin dihargai, jangan cuma minta dihormati.",
  "Piknik gih, biar otakmu tidak sempit dan gampang tersinggung.",
  "Suka mencampuri urusan orang lain, padahal urusan sendiri terlantar.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "sindiran",
  alias: ["sindiran", "roast"],
  category: "quotes",
  description: "Random kata-kata sindiran atau roast",
  usage: ".sindiran",
  example: ".sindiran",
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
    await m.reply(`"${pickRandom(sindiran)}"`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
