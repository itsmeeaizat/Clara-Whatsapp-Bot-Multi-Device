import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  if (duration <= 0) return "0 detik";
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor(duration / (1000 * 60 * 60));
  let parts = [];
  if (hours > 0) parts.push(`${hours} jam`);
  if (minutes > 0) parts.push(`${minutes} menit`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`);
  return parts.join(" ");
}

const pluginConfig = {
  name: "fightphonix",
  alias: ["fightphonix", "fightphoenix"],
  category: "rpg",
  description: "Pertarungan pet Phoenix melawan Phoenix liar",
  usage: ".fightphonix",
  example: ".fightphonix",
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
    const cooldownTime = 3600000; // 1 jam
    const now = Date.now();
    const lastFight = user.lastfightphonix || 0;

    if (now - lastFight < cooldownTime) {
      const remaining = cooldownTime - (now - lastFight);
      return await m.reply(`⚠️ Phoenix kamu masih kelelahan.\nTunggu *${msToTime(remaining)}* lagi sebelum bertarung!`);
    }

    const phonixLevel = user.phonix || user.phoenix || 1;
    const enemyLevel = Math.floor(Math.random() * 5) + 1;
    const isWin = Math.random() < 0.6; // 60% win chance

    user.lastfightphonix = now;

    if (isWin) {
      const rewardMoney = Math.floor(Math.random() * 35000) + 25000;
      const rewardExp = Math.floor(Math.random() * 1800) + 1000;
      user.money = (user.money || 0) + rewardMoney;
      user.exp = (user.exp || 0) + rewardExp;
      await db.write();

      await m.reply(
        `🔥 *PERTARUNGAN PHOENIX BERHASIL!*\n\n` +
        `⚔️ Phoenix kamu (Lvl ${phonixLevel}) menang melawan Phoenix liar (Lvl ${enemyLevel})!\n\n` +
        `🎁 *Hadiah:*\n` +
        `💰 Money: +Rp ${rewardMoney.toLocaleString("id-ID")}\n` +
        `✨ EXP: +${rewardExp}\n` +
        `💳 Total Uang: Rp ${user.money.toLocaleString("id-ID")}`
      );
    } else {
      const penaltyMoney = Math.min(user.money || 0, Math.floor(Math.random() * 15000) + 7000);
      user.money = (user.money || 0) - penaltyMoney;
      await db.write();

      await m.reply(
        `🔥 *PERTARUNGAN PHOENIX KALAH!*\n\n` +
        `💥 Phoenix kamu (Lvl ${phonixLevel}) kalah dari Phoenix liar (Lvl ${enemyLevel})!\n\n` +
        `💸 Kerugian: -Rp ${penaltyMoney.toLocaleString("id-ID")}\n` +
        `💳 Sisa Uang: Rp ${user.money.toLocaleString("id-ID")}`
      );
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
