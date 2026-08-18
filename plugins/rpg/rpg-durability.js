import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "durability",
  alias: ["dura", "cekalat", "tools"],
  category: "rpg",
  description: "Memeriksa ketahanan (durability) peralatan milikmu",
  usage: ".durability",
  example: ".durability",
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
    const kapak = user.kapak_durability !== undefined ? user.kapak_durability : (user.kapak ? 100 : "Tidak Punya");
    const pancingan = user.pancingan_durability !== undefined ? user.pancingan_durability : (user.pancingan ? 100 : "Tidak Punya");
    const cangkul = user.cangkul_durability !== undefined ? user.cangkul_durability : (user.cangkul ? 100 : "Tidak Punya");

    await m.reply(
      `🛠️ *KETAHANAN PERALATAN (DURABILITY)*

` +
      `🪓 Kapak: *${kapak}${typeof kapak === 'number' ? '/100' : ''}*
` +
      `🎣 Pancingan: *${pancingan}${typeof pancingan === 'number' ? '/100' : ''}*
` +
      `⛏️ Cangkul: *${cangkul}${typeof cangkul === 'number' ? '/100' : ''}*

` +
      `💡 Buat peralatan baru menggunakan perintah `.build`!`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
