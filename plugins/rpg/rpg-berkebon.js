import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "berkebon",
  alias: ["berkebun", "kebun", "harvest"],
  category: "rpg",
  description: "Bercocok tanam dan memanen buah-buahan segar",
  usage: ".berkebon",
  example: ".berkebon",
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
    const cooldownTime = 30 * 60 * 1000; // 30 menit
    const now = Date.now();
    const lastFarm = user.lastberkebon || 0;

    if (now - lastFarm < cooldownTime) {
      const remaining = cooldownTime - (now - lastFarm);
      return await m.reply(`⚠️ Kebunmu sedang dalam masa pemulihan.
Tunggu *${msToTime(remaining)}* lagi sebelum memanen kembali!`);
    }

    if ((user.stamina || 0) < 10) {
      return await m.reply(`⚡ Staminamu terlalu rendah (*${user.stamina || 0}/100*)! Butuh minimal 10 stamina untuk berkebun.`);
    }

    user.stamina = Math.max(0, (user.stamina || 100) - 10);

    const pisang = Math.floor(Math.random() * 5) + 1;
    const mangga = Math.floor(Math.random() * 4) + 1;
    const apel = Math.floor(Math.random() * 4) + 1;
    const jeruk = Math.floor(Math.random() * 5) + 1;
    const anggur = Math.floor(Math.random() * 3) + 1;
    const expGained = 150;

    user.pisang = (user.pisang || 0) + pisang;
    user.mangga = (user.mangga || 0) + mangga;
    user.apel = (user.apel || 0) + apel;
    user.jeruk = (user.jeruk || 0) + jeruk;
    user.anggur = (user.anggur || 0) + anggur;
    user.exp = (user.exp || 0) + expGained;
    user.lastberkebon = now;

    await db.write();

    await m.reply(
      `🌾 *PANEN KEBUN BERHASIL!*

` +
      `🍌 Pisang: *+${pisang}*
` +
      `🥭 Mangga: *+${mangga}*
` +
      `🍎 Apel: *+${apel}*
` +
      `🍊 Jeruk: *+${jeruk}*
` +
      `🍇 Anggur: *+${anggur}*

` +
      `✨ EXP: *+${expGained}*
` +
      `⚡ Sisa Stamina: *${user.stamina}/100*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
