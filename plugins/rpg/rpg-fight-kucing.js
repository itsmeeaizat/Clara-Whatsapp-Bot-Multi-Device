import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "fightkucing",
  alias: ["fightcat", "adukucing"],
  category: "rpg",
  description: "Adu pertarungan kucing peliharaan untuk melatih EXP",
  usage: ".fightkucing",
  example: ".fightkucing",
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
    if (!user.kucing) {
      return await m.reply("❌ Kamu belum punya kucing! Beli kucing di .petstore.");
    }

    const cooldownTime = 10 * 60 * 1000; // 10 menit
    const now = Date.now();
    const lastFight = user.lastfightkucing || 0;

    if (now - lastFight < cooldownTime) {
      const remaining = cooldownTime - (now - lastFight);
      return await m.reply(`⚠️ Kucingmu sedang istirahat. Tunggu *${msToTime(remaining)}* lagi!`);
    }

    const winChance = 0.6 + ((user.kucing_level || 1) * 0.05);
    const isWin = Math.random() < winChance;

    user.lastfightkucing = now;

    if (isWin) {
      const rewardMoney = Math.floor(Math.random() * 5000) + 3000;
      const rewardExp = Math.floor(Math.random() * 200) + 100;
      user.money = (user.money || 0) + rewardMoney;
      user.exp = (user.exp || 0) + rewardExp;
      user.kucing_exp = (user.kucing_exp || 0) + 30;

      await db.write();

      await m.reply(
        `🐱 *KUCINGMU MENANG BERTARUNG!*

` +
        `💰 Uang: *+Rp ${rewardMoney.toLocaleString("id-ID")}*
` +
        `✨ EXP User: *+${rewardExp}*
` +
        `🐾 EXP Kucing: *+30*`
      );
    } else {
      const loss = 1000;
      user.money = Math.max(0, (user.money || 0) - loss);
      await db.write();

      await m.reply(`🐱 *KUCINGMU KALAH BERTARUNG!*

Kamu kehilangan *Rp ${loss.toLocaleString("id-ID")}* untuk merawat lukanya.`);
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
