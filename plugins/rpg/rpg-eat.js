import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "eat",
  alias: ["makan", "consume"],
  category: "rpg",
  description: "Makan makanan untuk memulihkan kelaparan dan kesehatan",
  usage: ".eat [jumlah]",
  example: ".eat 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, args }) {
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
    let portion = parseInt(args[0]) || 1;
    portion = Math.max(1, portion);

    const availableFood = user.makanan || 0;
    if (availableFood < portion) {
      return await m.reply(`❌ Makananmu tidak cukup! Kamu hanya memiliki *${availableFood}* porsi makanan. Masak makanan dengan `.cook` terlebih dahulu!`);
    }

    const currentHunger = user.hunger || 50;
    const currentHealth = user.health || 100;

    if (currentHunger >= 100 && currentHealth >= 100) {
      return await m.reply(`😋 Kamu sudah kenyang dan HP mu penuh! Tidak perlu makan saat ini.`);
    }

    user.makanan -= portion;
    user.hunger = Math.min(100, currentHunger + (portion * 30));
    user.health = Math.min(100, currentHealth + (portion * 20));

    await db.write();

    await m.reply(
      `🍖 *NYAM! MAKAN BERHASIL!*

` +
      `Porsi dimakan: *${portion}*
` +
      `🍗 Kelaparan: *${user.hunger}/100*
` +
      `❤️ HP: *${user.health}/100*
` +
      `📦 Sisa Makanan: *${user.makanan}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
