// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor(duration / (1000 * 60 * 60));
  return `${hours} jam ${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "gajian",
  alias: ["gaji", "salary"],
  category: "rpg",
  description: "Klaim gaji harian berdasarkan level pengguna (24h cooldown)",
  usage: ".gajian",
  example: ".gajian",
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
    const cooldownTime = 24 * 60 * 60 * 1000; // 24 jam
    const now = Date.now();
    const lastClaim = user.lastgajian || 0;

    if (now - lastClaim < cooldownTime) {
      const remaining = cooldownTime - (now - lastClaim);
      return await m.reply(`⚠️ Kamu sudah mengambil gaji hari ini.
Tunggu *${msToTime(remaining)}* lagi!`);
    }

    const level = user.level || 1;
    const salaryMoney = 15000 + (level * 2500);
    const salaryExp = 500;

    user.money = (user.money || 0) + salaryMoney;
    user.exp = (user.exp || 0) + salaryExp;
    user.lastgajian = now;

    await db.write();

    await m.reply(
      `💵 *GAJIAN BERHASIL DIKLAIM!*

` +
      `📊 Level Pekerja: *${level}*
` +
      `💰 Gaji Diterima: *Rp ${salaryMoney.toLocaleString("id-ID")}*
` +
      `✨ EXP Bonus: *+${salaryExp}*

` +
      `💳 Total Uang: *Rp ${(user.money).toLocaleString("id-ID")}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
