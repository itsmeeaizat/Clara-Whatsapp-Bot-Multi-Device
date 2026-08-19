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
  name: "nguli",
  alias: ["nguli"],
  category: "rpg",
  description: "Bekerja sebagai kuli bangunan (cooldown 4 jam)",
  usage: ".nguli",
  example: ".nguli",
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
    const cooldownTime = 14400000; // 4 jam
    const now = Date.now();
    const lastNguli = user.lastnguli || 0;

    if (now - lastNguli < cooldownTime) {
      const remaining = cooldownTime - (now - lastNguli);
      return await m.reply(`⚠️ Kamu sudah bekerja sebagai kuli bangunan hari ini.\nTunggu selama *${msToTime(remaining)}* lagi sebelum mengambil shift baru!`);
    }

    const rewardMoney = Math.floor(Math.random() * 40000) + 30000;
    const rewardExp = Math.floor(Math.random() * 2000) + 1000;
    const rewardStone = Math.floor(Math.random() * 10) + 5;

    user.money = (user.money || 0) + rewardMoney;
    user.exp = (user.exp || 0) + rewardExp;
    user.stone = (user.stone || 0) + rewardStone;
    user.lastnguli = now;

    await db.write();

    await m.reply(
      `🧱 *UPAH KULI BANGUNAN BERHASIL DITERIMA!*\n\n` +
      `💪 Kamu telah membanting tulang seharian di proyek bangunan!\n\n` +
      `💰 Gaji: *Rp ${rewardMoney.toLocaleString("id-ID")}*\n` +
      `✨ EXP: *+${rewardExp}*\n` +
      `🪨 Batu Tambahan: *+${rewardStone} batu*\n` +
      `💳 Total Uang Kamu: *Rp ${user.money.toLocaleString("id-ID")}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
