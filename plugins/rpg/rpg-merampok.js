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
  name: "merampok",
  alias: ["merampok", "rob"],
  category: "rpg",
  description: "Merampok uang milik user lain (cooldown 2 jam)",
  usage: ".merampok @user",
  example: ".merampok @user",
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
    const cooldownTime = 7200000; // 2 jam
    const now = Date.now();
    const lastRob = user.lastrob || 0;

    if (now - lastRob < cooldownTime) {
      const remaining = cooldownTime - (now - lastRob);
      return await m.reply(`⚠️ Kamu masih buron dan bersembunyi dari polisi!\nTunggu selama *${msToTime(remaining)}* lagi sebelum merampok.`);
    }

    const targetId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    if (!targetId) {
      return await m.reply(`⚠️ Tag orang yang ingin kamu rampok!\nContoh: *.merampok @user*`);
    }

    if (targetId === m.sender) {
      return await m.reply(`❌ Kamu tidak bisa merampok diri sendiri!`);
    }

    const target = db.data.users[targetId];
    if (!target) {
      return await m.reply(`❌ User yang kamu tag belum terdaftar di database RPG!`);
    }

    if ((target.money || 0) < 10000) {
      return await m.reply(`❌ Korban tidak punya cukup uang untuk dirampok (minimal Rp 10.000). Kasihan dia!`);
    }

    const robbedAmount = Math.floor(Math.min(target.money, Math.random() * 40000 + 10000));
    target.money = (target.money || 0) - robbedAmount;
    user.money = (user.money || 0) + robbedAmount;
    user.lastrob = now;

    await db.write();

    await m.reply(
      `🔫 *PERAMPOKAN BERHASIL!*\n\n` +
      `💥 Kamu berhasil merampok user tersebut dan membawa lari uang sebesar *Rp ${robbedAmount.toLocaleString("id-ID")}*!\n\n` +
      `💰 Total Uang Kamu: *Rp ${user.money.toLocaleString("id-ID")}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
