// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "buah",
  alias: ["fruit", "panenbuah"],
  category: "rpg",
  description: "Menampilkan inventaris buah-buahan milikmu",
  usage: ".buah",
  example: ".buah",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!db.data) db.data = {};
    if (!db.data.users) db.data.users = {};
    if (!db.data.users[m.sender]) {
      db.data.users[m.sender] = {
        money: 0,
        exp: 0,
        level: 1,
        health: 100,
        hunger: 50,
        stamina: 100,
      };
      await db.write();
    }

    const user = db.data.users[m.sender];
    const pisang = user.pisang || 0;
    const mangga = user.mangga || 0;
    const apel = user.apel || 0;
    const jeruk = user.jeruk || 0;
    const anggur = user.anggur || 0;

    const totalBuah = pisang + mangga + apel + jeruk + anggur;

    await m.reply(
      `🍎 *INVENTARIS BUAH-BUAHAN*

` +
      `🍌 Pisang: *${pisang}* buah
` +
      `🥭 Mangga: *${mangga}* buah
` +
      `🍎 Apel: *${apel}* buah
` +
      `🍊 Jeruk: *${jeruk}* buah
` +
      `🍇 Anggur: *${anggur}* buah

` +
      `📦 Total Buah: *${totalBuah}* buah
` +
      `💡 *Tips:* Gunakan buah untuk dimasak (*.cook*) atau dijual di toko!`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
