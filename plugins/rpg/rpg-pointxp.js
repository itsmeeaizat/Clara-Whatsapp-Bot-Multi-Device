import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "pointxp",
  alias: ["pointxp", "expoint"],
  category: "rpg",
  description: "Menampilkan statistik XP, level, dan alokasi poin RPG",
  usage: ".pointxp [atribut] [jumlah]",
  example: ".pointxp strength 1",
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
    const attr = (args && args[0] ? args[0] : "").toLowerCase();
    const count = Math.max(1, parseInt(args && args[1] ? args[1] : "1") || 1);

    const validAttrs = ["strength", "mana", "stamina", "agility", "intelligence"];

    if (!attr || !validAttrs.includes(attr)) {
      return await m.reply(
        `📊 *STATISTIK & POIN RPG USER*\n\n` +
        `👤 Level: ${user.level || 1}\n` +
        `✨ EXP: ${user.exp || 0}\n` +
        `⭐ Available Point XP: ${user.pointxp || 0}\n\n` +
        `💪 Strength: ${user.strength || 0}\n` +
        `🔮 Mana: ${user.mana || 0}\n` +
        `⚡ Stamina: ${user.stamina || 100}\n` +
        `🏃 Agility: ${user.agility || 0}\n` +
        `🧠 Intelligence: ${user.intelligence || 0}\n\n` +
        `📌 *Cara Menambah Atribut:*\n` +
        `*.pointxp strength 1*\n` +
        `Pilihan Atribut: strength, mana, stamina, agility, intelligence`
      );
    }

    if ((user.pointxp || 0) < count) {
      return await m.reply(`❌ Kamu tidak memiliki cukup Point XP! (Punya: ${user.pointxp || 0})`);
    }

    user.pointxp -= count;
    user[attr] = (user[attr] || 0) + count;
    await db.write();

    await m.reply(
      `✅ *BERHASIL MENINGKATKAN ATRIBUT!*\n\n` +
      `✨ Atribut *${attr.toUpperCase()}* bertambah +${count}!\n` +
      `📊 Nilai sekarang: ${user[attr]}\n` +
      `⭐ Sisa Point XP: ${user.pointxp}`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
