// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
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
  name: "nebang",
  alias: ["nebang", "menebang", "chop"],
  category: "rpg",
  description: "Menebang pohon di hutan untuk mendapatkan kayu",
  usage: ".nebang",
  example: ".nebang",
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
    const lastNebang = user.lastlumber || user.lastnebang || 0;

    if (now - lastNebang < cooldownTime) {
      const remaining = cooldownTime - (now - lastNebang);
      return await m.reply(`⚠️ Kamu masih kelelahan setelah menebang pohon.\nTunggu selama *${msToTime(remaining)}* lagi.`);
    }

    if ((user.stamina || 0) < 10) {
      return await m.reply(`⚠️ Stamina kamu kurang dari 10! Makan dulu untuk memulihkan stamina.`);
    }

    const earnedWood = Math.floor(Math.random() * 40) + 10;
    const earnedMoney = Math.floor(Math.random() * 5000) + 2000;
    const earnedExp = Math.floor(Math.random() * 300) + 100;

    user.wood = (user.wood || 0) + earnedWood;
    user.money = (user.money || 0) + earnedMoney;
    user.exp = (user.exp || 0) + earnedExp;
    user.stamina = Math.max(0, (user.stamina || 100) - 10);
    user.lastnebang = now;
    user.lastlumber = now;

    await db.write();

    await m.reply(
      `🪓 *BERHASIL MENEBANG POHON!*\n\n` +
      `🌳 Wood: +${earnedWood} kayu\n` +
      `💰 Money: +Rp ${earnedMoney.toLocaleString("id-ID")}\n` +
      `✨ EXP: +${earnedExp}\n` +
      `⚡ Stamina: -10 (Sisa: ${user.stamina}/100)\n\n` +
      `🪵 Total Kayu Kamu: *${user.wood} kayu*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
