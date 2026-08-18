import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "chop",
  alias: ["nebang", "tebang", "woodcut"],
  category: "rpg",
  description: "Menebang pohon untuk mendapatkan kayu (menggunakan stamina)",
  usage: ".chop",
  example: ".chop",
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
    const cooldownTime = 3 * 60 * 1000; // 3 menit
    const now = Date.now();
    const lastChop = user.lastchop || 0;

    if (now - lastChop < cooldownTime) {
      const remaining = cooldownTime - (now - lastChop);
      return await m.reply(`⚠️ Tanganmu masih lelah tebang pohon.
Tunggu *${msToTime(remaining)}* lagi!`);
    }

    if ((user.stamina || 0) < 10) {
      return await m.reply(`⚡ Staminamu terlalu rendah (*${user.stamina || 0}/100*)! Butuh minimal 10 stamina untuk menebang kayu.`);
    }

    user.stamina = Math.max(0, (user.stamina || 100) - 10);

    const woodGained = Math.floor(Math.random() * 11) + 5; // 5 - 15 kayu
    const expGained = Math.floor(Math.random() * 101) + 80;

    user.wood = (user.wood || 0) + woodGained;
    user.exp = (user.exp || 0) + expGained;
    user.lastchop = now;

    if (user.kapak_durability) {
      user.kapak_durability = Math.max(0, user.kapak_durability - 5);
    }

    await db.write();

    await m.reply(
      `🪓 *BERHASIL MENEBANG POHON!*

` +
      `🪵 Kayu Didapat: *+${woodGained}*
` +
      `✨ EXP: *+${expGained}*
` +
      `⚡ Sisa Stamina: *${user.stamina}/100*
` +
      `📦 Total Kayu: *${user.wood}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
