/**
 * Quotes Hacker
 * Usage: .hacker
 */

const hacker = [
  "Dear kamu yang tertulis di halaman defacementku, kapan jadi pacarku?",
  "Aku rela jadi processor yang kepanasan, asalkan kamu yang jadi heatsink-nya yang setiap saat bisa mendinginkan aku.",
  "Gak usah nyari celah XSS deh, karena ketika kamu ngeklik hatiku udah muncul pop-up namamu.",
  "Berharap setelah aku berhasil login di hati kamu ga akan ada tombol logout, dan sessionku ga bakal pernah expired.",
  "Masa aku harus pake teknik symlink bypass buat buka-buka folder hatimu yang open_basedir enabled.",
  "Diriku dan Dirimu itu ibarat PHP dan MySQL yang belum terkoneksi.",
  "Jangan cuma bisa inject hatinya, tapi harus bisa patchnya juga. Biar tidak selingkuh sama hacker lain.",
  "Aku memang programmer PHP, tapi aku nggak akan php-in kamu kok.",
  "Kamu wanita yang paling Unix yang pernah aku kenal.",
  "Sayang, capslock kamu nyala ya? Ngga, kenapa emangnya? Soalnya nama kamu ketulis gede bgt di hati aku.",
  "Aku deketin kamu cuma untuk redirect ke hati temenmu.",
  "Domain aja bisa parkir, masa cintaku ga bisa parkir di hatimu?",
  "Aku boleh jadi pacarmu? 400 Bad Request. Aku cium boleh? 401 Authorization Required.",
  "Kamu tau ga bedanya kamu sama sintax PHP, kalau sintax PHP itu susah dihafalin, kalau kamu itu susah dilupain.",
  "Kamu dulu sekolah SMK ambil kejuruan apa? Teknik Komputer Jaringan. Terus sekarang bisa apa aja? Menjaring hatimu lewat komputerku.",
  "Aku selalu pakai HTTPS, biara koneksi kita selalu aman dan terenkripsi.",
  "Kalau cinta itu seperti virus, aku bersedia tidak memasang antivirus.",
  "Hatiku seperti open source, kamu bebas melihat dan memodifikasi.",
  "Aku mau jadi firewall-mu, melindungimu dari serangan hati orang lain.",
  "Kamu adalah root password hatiku, tanpa kamu aku tidak bisa akses perasaanku sendiri.",
  "Mari kita buat koneksi TCP three-way handshake: SYN, SYN-ACK, ACK cintaku padamu.",
  "Jika aku adalah DNS server, kamu adalah domain utama yang selalu aku resolve.",
  "Ping ke hatimu berhasil, tapi RTT-nya terasa seperti selamanya.",
  "Aku rela di-DDoS asalkan packet-nya dari kamu.",
  "Seperti SSH key, hatiku hanya bisa dibuka dengan public key milikmu.",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const pluginConfig = {
  name: "hacker",
  alias: ["heker", "hekel"],
  category: "quotes",
  description: "Random quotes hacker style",
  usage: ".hacker",
  example: ".hacker",
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
    await m.reply(pickRandom(hacker));
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
