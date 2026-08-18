import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "fightnaga",
  alias: ["fightdragon", "adunaga"],
  category: "rpg",
  description: "Pertarungan naga peliharaan untuk hadiah bernilai tinggi",
  usage: ".fightnaga",
  example: ".fightnaga",
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
    if (!user.naga) {
      return await m.reply("❌ Kamu belum memiliki Naga! Beli Naga di .petstore terlebih dahulu.");
    }

    const cooldownTime = 30 * 60 * 1000; // 30 menit
    const now = Date.now();
    const lastFight = user.lastfightnaga || 0;

    if (now - lastFight < cooldownTime) {
      const remaining = cooldownTime - (now - lastFight);
      return await m.reply(`⚠️ Nagamu sedang memulihkan napas apinya. Tunggu *${msToTime(remaining)}* lagi!`);
    }

    if ((user.stamina || 0) < 20) {
      return await m.reply(`⚡ Staminamu kurang (*${user.stamina || 0}/100*)! Butuh minimal 20 stamina.`);
    }

    user.stamina = Math.max(0, (user.stamina || 100) - 20);
    user.lastfightnaga = now;

    const isWin = Math.random() < 0.7;

    if (isWin) {
      const rewardMoney = Math.floor(Math.random() * 20000) + 15000;
      const rewardExp = Math.floor(Math.random() * 1000) + 500;
      const rewardDiamond = Math.random() < 0.3 ? 1 : 0;

      user.money = (user.money || 0) + rewardMoney;
      user.exp = (user.exp || 0) + rewardExp;
      if (rewardDiamond) user.diamond = (user.diamond || 0) + rewardDiamond;
      user.naga_exp = (user.naga_exp || 0) + 80;

      await db.write();

      await m.reply(
        `🐉 *PERTARUNGAN NAGA MENANG SPESTAKULER!*

` +
        `💰 Uang: *+Rp ${rewardMoney.toLocaleString("id-ID")}*
` +
        `✨ EXP: *+${rewardExp}*
` +
        (rewardDiamond ? `💎 Diamond: *+1*
` : "") +
        `🐉 EXP Naga: *+80*`
      );
    } else {
      user.health = Math.max(10, (user.health || 100) - 25);
      await db.write();

      await m.reply(`🐉 *NAGAMU TERLUKA DALAM PERTARUNGAN!*

HP mu berkurang menjadi *${user.health}/100*.`);
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
