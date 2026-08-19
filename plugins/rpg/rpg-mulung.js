// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "mulung",
  alias: ["scavenge", "pulung"],
  category: "rpg",
  description: "Mencari barang bekas/sampah untuk dijual (cooldown 1 jam)",
  usage: ".mulung",
  example: ".mulung",
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
    const cooldownTime = 60 * 60 * 1000; // 1 jam
    const now = Date.now();
    const lastMulung = user.lastmulung || 0;

    if (now - lastMulung < cooldownTime) {
      const remaining = cooldownTime - (now - lastMulung);
      return await m.reply(`⚠️ Kamu baru saja selesai mulung.
Tunggu *${msToTime(remaining)}* lagi!`);
    }

    const moneyEarned = Math.floor(Math.random() * 5000) + 3000;
    const expGained = Math.floor(Math.random() * 150) + 50;

    user.money = (user.money || 0) + moneyEarned;
    user.exp = (user.exp || 0) + expGained;
    user.lastmulung = now;

    await db.write();

    await m.reply(
      `🗑️ *MULUNG BERHASIL!*

` +
      `Kamu menemukan banyak botol & kardus bekas lalu menjualnya.
` +
      `💰 Hasil Penjualan: *+Rp ${moneyEarned.toLocaleString("id-ID")}*
` +
      `✨ EXP: *+${expGained}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
