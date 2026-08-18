import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let days = Math.floor(duration / (1000 * 60 * 60 * 24));
  return `${days} hari ${hours} jam ${minutes} menit`;
}

const pluginConfig = {
  name: "weekly",
  alias: ["mingguan", "claimweekly"],
  category: "rpg",
  description: "Klaim hadiah mingguan (cooldown 7 hari)",
  usage: ".weekly",
  example: ".weekly",
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
    const cooldownTime = 7 * 24 * 60 * 60 * 1000; // 7 hari
    const now = Date.now();
    const lastClaim = user.lastweekly || 0;

    if (now - lastClaim < cooldownTime) {
      const remaining = cooldownTime - (now - lastClaim);
      return await m.reply(`⚠️ Kamu sudah mengambil hadiah mingguan.
Tunggu *${msToTime(remaining)}* lagi!`);
    }

    const money = 40000;
    const exp = 4000;
    const diamond = 3;
    const gold = 15;

    user.money = (user.money || 0) + money;
    user.exp = (user.exp || 0) + exp;
    user.diamond = (user.diamond || 0) + diamond;
    user.gold = (user.gold || 0) + gold;
    user.lastweekly = now;

    await db.write();

    await m.reply(
      `🗓️ *HADIAH MINGGUAN BERHASIL DIKLAIM!*

` +
      `💰 Uang: *+Rp ${money.toLocaleString("id-ID")}*
` +
      `✨ EXP: *+${exp}*
` +
      `💎 Diamond: *+${diamond}*
` +
      `🪙 Gold: *+${gold}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
