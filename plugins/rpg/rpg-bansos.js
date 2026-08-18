import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor(duration / (1000 * 60 * 60));
  return `${hours} jam ${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "bansos",
  alias: ["bansos"],
  category: "rpg",
  description: "Klaim bantuan sosial (uang gratis) setiap 24 jam",
  usage: ".bansos",
  example: ".bansos",
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
        thirst: 50,
        stamina: 100,
        fish: 0,
        coal: 0,
        gold: 0,
        diamond: 0,
        iron: 0,
        wood: 0,
        stone: 0,
      };
      await db.write();
    }

    const user = db.data.users[m.sender];
    const cooldownTime = 86400000; // 24 jam
    const now = Date.now();
    const lastClaim = user.lastbansos || 0;

    if (now - lastClaim < cooldownTime) {
      const remaining = cooldownTime - (now - lastClaim);
      return await m.reply(`⚠️ Kamu sudah mengambil bansos hari ini.\nTunggu selama *${msToTime(remaining)}* lagi!`);
    }

    const reward = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    user.money = (user.money || 0) + reward;
    user.lastbansos = now;
    await db.write();

    await m.reply(`🎉 *KLAIM BANSOS BERHASIL!*\n\n💰 Kamu mendapatkan bantuan sebesar *Rp ${reward.toLocaleString("id-ID")}*\n💳 Total Uang: *Rp ${(user.money).toLocaleString("id-ID")}*`);
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
