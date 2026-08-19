// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "collect",
  alias: ["kumpul", "collector"],
  category: "rpg",
  description: "Mengumpulkan sumber daya acak dari alam sekitar",
  usage: ".collect",
  example: ".collect",
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
    const cooldownTime = 60 * 60 * 1000; // 1 jam
    const now = Date.now();
    const lastCollect = user.lastcollect || 0;

    if (now - lastCollect < cooldownTime) {
      const remaining = cooldownTime - (now - lastCollect);
      return await m.reply(`⚠️ Kamu sudah mengumpulkan sumber daya.
Tunggu *${msToTime(remaining)}* lagi untuk collect berikutnya!`);
    }

    const wood = Math.floor(Math.random() * 11) + 5;
    const stone = Math.floor(Math.random() * 11) + 5;
    const coal = Math.floor(Math.random() * 7) + 2;
    const iron = Math.floor(Math.random() * 5) + 1;
    const money = Math.floor(Math.random() * 4000) + 1000;
    const exp = Math.floor(Math.random() * 200) + 100;

    user.wood = (user.wood || 0) + wood;
    user.stone = (user.stone || 0) + stone;
    user.coal = (user.coal || 0) + coal;
    user.iron = (user.iron || 0) + iron;
    user.money = (user.money || 0) + money;
    user.exp = (user.exp || 0) + exp;
    user.lastcollect = now;

    await db.write();

    await m.reply(
      `🧺 *PENGUMPULAN SUMBER DAYA BERHASIL!*

` +
      `🪵 Kayu: *+${wood}*
` +
      `🪨 Batu: *+${stone}*
` +
      `⬛ Batubara: *+${coal}*
` +
      `⛓️ Besi: *+${iron}*
` +
      `💰 Uang: *+Rp ${money.toLocaleString("id-ID")}*
` +
      `✨ EXP: *+${exp}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
