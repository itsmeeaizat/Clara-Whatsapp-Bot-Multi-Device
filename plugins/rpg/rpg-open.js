import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "open",
  alias: ["open", "buka"],
  category: "rpg",
  description: "Membuka item box, crate, atau peti hadiah RPG",
  usage: ".open <tipe_box> [jumlah]",
  example: ".open common 1",
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
    const boxType = (args && args[0] ? args[0] : "").toLowerCase();
    const count = Math.max(1, parseInt(args && args[1] ? args[1] : "1") || 1);

    const validBoxes = ["common", "uncommon", "mythic", "legendary", "petbox"];

    if (!validBoxes.includes(boxType)) {
      return await m.reply(
        `🎁 *OPEN ITEM BOX RPG*\n\n` +
        `Format: *.open <tipe> [jumlah]*\n` +
        `Contoh: *.open common 1*\n\n` +
        `📋 *Box Yang Dimiliki:*\n` +
        `📦 Common: ${user.common || 0}\n` +
        `🎁 Uncommon: ${user.uncommon || 0}\n` +
        `🔮 Mythic: ${user.mythic || 0}\n` +
        `👑 Legendary: ${user.legendary || 0}\n` +
        `🐾 Petbox: ${user.petbox || 0}`
      );
    }

    if ((user[boxType] || 0) < count) {
      return await m.reply(`❌ Kamu tidak memiliki cukup *${boxType}*! (Stok: ${user[boxType] || 0})`);
    }

    user[boxType] -= count;

    let rewardMoney = count * (Math.floor(Math.random() * 5000) + 2000);
    let rewardExp = count * (Math.floor(Math.random() * 500) + 200);

    user.money = (user.money || 0) + rewardMoney;
    user.exp = (user.exp || 0) + rewardExp;

    await db.write();

    await m.reply(
      `🎉 *BERHASIL MEMBUKA ${count} ${boxType.toUpperCase()}!*\n\n` +
      `💰 Money: +Rp ${rewardMoney.toLocaleString("id-ID")}\n` +
      `✨ EXP: +${rewardExp}\n` +
      `💳 Total Uang Kamu: Rp ${user.money.toLocaleString("id-ID")}`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
