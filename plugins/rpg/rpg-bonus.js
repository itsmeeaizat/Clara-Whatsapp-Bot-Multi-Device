import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor(duration / (1000 * 60 * 60));
  return `${hours} jam ${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "bonus",
  alias: ["claimbonus", "bonusdaily"],
  category: "rpg",
  description: "Klaim bonus harian setiap 24 jam",
  usage: ".bonus",
  example: ".bonus",
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
    const lastClaim = user.lastbonus || 0;

    if (now - lastClaim < cooldownTime) {
      const remaining = cooldownTime - (now - lastClaim);
      return await m.reply(`⚠️ Kamu sudah mengambil bonus harian.
Tunggu selama *${msToTime(remaining)}* lagi!`);
    }

    const rewardMoney = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
    const rewardExp = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;
    const rewardStamina = 20;

    user.money = (user.money || 0) + rewardMoney;
    user.exp = (user.exp || 0) + rewardExp;
    user.stamina = Math.min(100, (user.stamina || 100) + rewardStamina);
    user.lastbonus = now;

    await db.write();

    await m.reply(
      `🎁 *BONUS HARIAN BERHASIL DIKLAIM!*

` +
      `💰 Uang: *+Rp ${rewardMoney.toLocaleString("id-ID")}*
` +
      `✨ EXP: *+${rewardExp}*
` +
      `⚡ Stamina: *+${rewardStamina}*

` +
      `💳 Total Uang: *Rp ${(user.money).toLocaleString("id-ID")}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
