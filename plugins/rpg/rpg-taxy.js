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
  name: "taxy",
  alias: ["taxy", "taxi", "grab"],
  category: "rpg",
  description: "Bekerja sebagai supir taksi (cooldown 3 jam)",
  usage: ".taxy",
  example: ".taxy",
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
    const cooldownTime = 10800000; // 3 jam
    const now = Date.now();
    const lastTaxy = user.lasttaxy || user.lastgrab || 0;

    if (now - lastTaxy < cooldownTime) {
      const remaining = cooldownTime - (now - lastTaxy);
      return await m.reply(`⚠️ Taksi kamu sedang diservis / kamu lelah menyetir!\nTunggu selama *${msToTime(remaining)}* lagi.`);
    }

    const rewardMoney = Math.floor(Math.random() * 30000) + 20000;
    const rewardExp = Math.floor(Math.random() * 1500) + 800;

    user.money = (user.money || 0) + rewardMoney;
    user.exp = (user.exp || 0) + rewardExp;
    user.lasttaxy = now;
    user.lastgrab = now;

    await db.write();

    await m.reply(
      `🚖 *NARIK TAKSI SELESAI!*\n\n` +
      `🚕 Kamu telah mengantar beberapa penumpang sampai tujuan dengan selamat!\n\n` +
      `💰 Hasil Tarif: *Rp ${rewardMoney.toLocaleString("id-ID")}*\n` +
      `✨ EXP: *+${rewardExp}*\n` +
      `💳 Total Uang Kamu: *Rp ${user.money.toLocaleString("id-ID")}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
