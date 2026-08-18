import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "nambang",
  alias: ["mining", "tambang"],
  category: "rpg",
  description: "Menambang coal, iron, gold, dan diamond dari goa",
  usage: ".nambang",
  example: ".nambang",
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
    const cooldownTime = 5 * 60 * 1000; // 5 menit
    const now = Date.now();
    const lastMine = user.lastnambang || 0;

    if (now - lastMine < cooldownTime) {
      const remaining = cooldownTime - (now - lastMine);
      return await m.reply(`⚠️ Tanganmu lelah menambang batu.
Tunggu *${msToTime(remaining)}* lagi!`);
    }

    if ((user.stamina || 0) < 15) {
      return await m.reply(`⚡ Staminamu terlalu rendah (*${user.stamina || 0}/100*)! Butuh minimal 15 stamina.`);
    }

    user.stamina = Math.max(0, (user.stamina || 100) - 15);

    const stone = Math.floor(Math.random() * 15) + 10;
    const coal = Math.floor(Math.random() * 8) + 3;
    const iron = Math.floor(Math.random() * 5) + 2;
    const gold = Math.random() < 0.4 ? Math.floor(Math.random() * 3) + 1 : 0;
    const diamond = Math.random() < 0.1 ? 1 : 0;
    const exp = Math.floor(Math.random() * 200) + 150;

    user.stone = (user.stone || 0) + stone;
    user.coal = (user.coal || 0) + coal;
    user.iron = (user.iron || 0) + iron;
    user.gold = (user.gold || 0) + gold;
    user.diamond = (user.diamond || 0) + diamond;
    user.exp = (user.exp || 0) + exp;
    user.lastnambang = now;

    await db.write();

    await m.reply(
      `⛏️ *BERHASIL MENAMBANG INTI GOA!*

` +
      `🪨 Batu: *+${stone}*
` +
      `⬛ Batubara: *+${coal}*
` +
      `⛓️ Besi: *+${iron}*
` +
      (gold ? `🪙 Emas: *+${gold}*
` : "") +
      (diamond ? `💎 Diamond: *+${diamond}*
` : "") +
      `✨ EXP: *+${exp}*
` +
      `⚡ Sisa Stamina: *${user.stamina}/100*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
