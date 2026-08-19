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
  name: "maling",
  alias: ["maling", "steal"],
  category: "rpg",
  description: "Mencuri uang dari orang/user lain (sukses 50%, cooldown 1 jam)",
  usage: ".maling [@user]",
  example: ".maling @user",
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
    const lastMaling = user.lastmaling || user.lastmulung || 0;

    if (now - lastMaling < cooldownTime) {
      const remaining = cooldownTime - (now - lastMaling);
      return await m.reply(`⚠️ Kamu masih bersembunyi dari kejaran warga!\nTunggu selama *${msToTime(remaining)}* lagi.`);
    }

    let targetId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    let target = targetId && db.data.users[targetId] ? db.data.users[targetId] : null;

    const isSuccess = Math.random() < 0.5; // 50% success rate
    user.lastmaling = now;

    if (isSuccess) {
      let stolen = 0;
      if (target && (target.money || 0) >= 5000) {
        stolen = Math.floor((target.money || 0) * (Math.random() * 0.2 + 0.1)); // 10-30%
        stolen = Math.max(stolen, 2000);
        target.money = (target.money || 0) - stolen;
      } else {
        stolen = Math.floor(Math.random() * 15000) + 5000;
      }

      user.money = (user.money || 0) + stolen;
      await db.write();

      await m.reply(
        `🥷 *AKSI MALING BERHASIL!*\n\n` +
        `💰 Kamu berhasil menguntit dan mencuri uang sebesar *Rp ${stolen.toLocaleString("id-ID")}*!\n` +
        `💳 Total Uang Kamu: *Rp ${user.money.toLocaleString("id-ID")}*`
      );
    } else {
      const fine = Math.min(user.money || 0, Math.floor(Math.random() * 10000) + 3000);
      user.money = (user.money || 0) - fine;
      await db.write();

      await m.reply(
        `🚨 *AKSI MALING GAGAL!*\n\n` +
        `💥 Kamu tertangkap basah oleh warga saat hendak mencuri!\n` +
        `💸 Denda/Kerugian: *-Rp ${fine.toLocaleString("id-ID")}*\n` +
        `💳 Sisa Uang Kamu: *Rp ${user.money.toLocaleString("id-ID")}*`
      );
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
