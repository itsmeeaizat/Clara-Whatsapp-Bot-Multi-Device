// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "feed",
  alias: ["feedpet", "berimakan"],
  category: "rpg",
  description: "Memberi makan hewan peliharaan milikmu",
  usage: ".feed <kucing/naga/rubah/kuda>",
  example: ".feed kucing",
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
    const petType = args[0] ? args[0].toLowerCase() : null;

    if (!petType || !["kucing", "naga", "rubah", "kuda"].includes(petType)) {
      return await m.reply("❌ Pilih hewan yang ingin diberi makan: .feed kucing, .feed naga, .feed rubah, atau .feed kuda.");
    }

    if (!user[petType]) {
      return await m.reply(`❌ Kamu belum memiliki ${petType}! Beli di .petstore terlebih dahulu.`);
    }

    if ((user.makanan || 0) < 1 && (user.fish || 0) < 1) {
      return await m.reply(`❌ Kamu tidak punya makanan atau ikan untuk ${petType}!`);
    }

    if ((user.makanan || 0) >= 1) {
      user.makanan -= 1;
    } else {
      user.fish -= 1;
    }

    const expKey = petType + "_exp";
    const lvlKey = petType + "_level";

    user[expKey] = (user[expKey] || 0) + 50;
    let lvl = user[lvlKey] || 1;

    let leveledUp = false;
    if (user[expKey] >= lvl * 100) {
      user[lvlKey] = lvl + 1;
      user[expKey] -= lvl * 100;
      leveledUp = true;
    }

    await db.write();

    await m.reply(
      `🐾 *MEMBERI MAKAN ${petType.toUpperCase()} BERHASIL!*

` +
      `✨ EXP Pet: *+50*
` +
      (leveledUp ? `🎉 *LEVEL UP!* ${petType} naik ke Level *${user[lvlKey]}*!` : `📊 Level ${petType}: *${user[lvlKey] || 1}*`)
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
