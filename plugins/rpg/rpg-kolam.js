// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "kolam",
  alias: ["fishpond", "kolamikan"],
  category: "rpg",
  description: "Menampilkan kolam dan tangkapan ikan milikmu",
  usage: ".kolam",
  example: ".kolam",
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
    const fish = user.fish || 0;
    const hiu = user.hiu || 0;
    const paus = user.paus || 0;
    const kepiting = user.kepiting || 0;
    const cumi = user.cumi || 0;

    const totalEkor = fish + hiu + paus + kepiting + cumi;

    await m.reply(
      `🐟 *KOLAM & TANGKAPAN IKAN*

` +
      `🐟 Ikan Biasa: *${fish}* ekor
` +
      `🦈 Ikan Hiu: *${hiu}* ekor
` +
      `🐋 Ikan Paus: *${paus}* ekor
` +
      `🦀 Kepiting: *${kepiting}* ekor
` +
      `🦑 Cumi-Cumi: *${cumi}* ekor

` +
      `🌊 Total Tangkapan: *${totalEkor}* ekor
` +
      `💡 *Tips:* Gunakan .shopfish untuk menjual ikan hasil tangkapanmu!`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
