// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Quotes Dare (Tantangan)
 * Usage: .dare
 */

const dare = [
  "Kirim pesan ke orang terakhir yang chat kamu: 'Aku lagi butuh uang nih, bisa pinjam 50rb?'",
  "Telepon nomor random dan bilang: 'Halo, ini pusat layanan pelanggan. Apakah ada yang bisa kami bantu?'",
  "Ganti nama profil-mu jadi 'Jomblo Nasional' selama 24 jam.",
  "Kirim voice note menyanyikan lagu kebangsaan dengan nada palsu.",
  "Bilang ke orang pertama yang chat kamu: 'Kamu tahu tidak, aku sebenarnya alien.'",
  "Foto selfie dengan ekspresi paling jelek dan jadikan profil selama 1 jam.",
  "Ceritakan rahasia paling memalukan tentang diri kamu di grup ini.",
  "Kirim pesan ke kontak ke-7 di daftar kontak kamu: 'Aku kangen kamu banget.'",
  "Telepon teman dekat dan bilang: 'Aku mau curhat, aku sebenarnya suka sama dia.' tanpa konteks.",
  "Bikin status WhatsApp: 'Lagi butuh teman curhat, DM aja.'",
  "Kirim pesan ke nomor random: 'Kamu ingat aku? Kita pernah ketemu di mall.'",
  "Bilang 3 hal jujur tentang orang yang ada di sebelah kanan kamu (kalau di grup, tag seseorang).",
  "Kirim voice note membaca pantun dengan nada melengking.",
  "Ganti bio WhatsApp jadi 'Sedang mencari jodoh, apply via DM.' selama 6 jam.",
  "Kirim pesan ke ex kamu: 'Kamu lagi apa? Aku kangen nih.' (atau jika tidak punya ex, ke teman terdekat).",
  "Bilang 3 kebiasaan buruk yang kamu sembunyikan dari orang lain.",
  "Telepon seseorang dan nyanyikan 'Selamat Ulang Tahun' tanpa alasan.",
  "Foto benda paling aneh di rumah kamu dan kirim ke grup.",
  "Kirim pesan ke kontak ke-3: 'Aku baru tahu kalau kamu itu saudaraku yang hilang.'",
  "Bikin video 10 detik menari gerakan aneh dan kirim ke grup.",
  "Ceritakan mimpi teraneh yang pernah kamu alami.",
  "Kirim pesan ke 5 orang: 'Kalau kamu bisa jadi hewan, kamu mau jadi apa?' lalu jawab sendiri dulu.",
  "Ganti profil jadi foto meme paling lucu yang kamu punya selama 12 jam.",
  "Bilang ke seseorang di grup: 'Sebenarnya aku iri sama kamu karena...' lanjutkan dengan jujur.",
  "Telepon seseorang dan bicara dengan aksen daerah yang bukan asal kamu selama 1 menit.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "dare",
  alias: ["tantangan"],
  category: "quotes",
  description: "Random dare / tantangan",
  usage: ".dare",
  example: ".dare",
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
    await m.reply(`*🎯 Dare*\n\n${pickRandom(dare)}`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
