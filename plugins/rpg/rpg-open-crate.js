// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "opencrate",
  alias: ["opencrate", "crate"],
  category: "rpg",
  description: "Membuka crate hadiah RPG (common, uncommon, mythic, legendary)",
  usage: ".opencrate <tipe> [jumlah]",
  example: ".opencrate common 1",
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
    const crateType = (args && args[0] ? args[0] : "").toLowerCase();
    const count = Math.max(1, parseInt(args && args[1] ? args[1] : "1") || 1);

    const validCrates = ["common", "uncommon", "mythic", "legendary"];

    if (!validCrates.includes(crateType)) {
      return await m.reply(
        `📦 *OPEN CRATE RPG*\n\n` +
        `Format: *.opencrate <tipe> [jumlah]*\n` +
        `Contoh: *.opencrate common 1*\n\n` +
        `📋 *Daftar Crate Kamu:*\n` +
        `📦 Common Crate: ${user.common || 0}\n` +
        `🎁 Uncommon Crate: ${user.uncommon || 0}\n` +
        `🔮 Mythic Crate: ${user.mythic || 0}\n` +
        `👑 Legendary Crate: ${user.legendary || 0}`
      );
    }

    if ((user[crateType] || 0) < count) {
      return await m.reply(`❌ Kamu tidak memiliki cukup *${crateType} crate*! (Punya: ${user[crateType] || 0}, Butuh: ${count})`);
    }

    user[crateType] -= count;

    let rewardMoney = 0;
    let rewardExp = 0;
    let rewardPotion = 0;
    let rewardDiamond = 0;
    let rewardGold = 0;

    for (let i = 0; i < count; i++) {
      if (crateType === "common") {
        rewardMoney += Math.floor(Math.random() * 5000) + 1000;
        rewardExp += Math.floor(Math.random() * 500) + 100;
        if (Math.random() < 0.3) rewardPotion += 1;
      } else if (crateType === "uncommon") {
        rewardMoney += Math.floor(Math.random() * 15000) + 5000;
        rewardExp += Math.floor(Math.random() * 1200) + 300;
        if (Math.random() < 0.5) rewardPotion += 1;
        if (Math.random() < 0.2) rewardGold += 1;
      } else if (crateType === "mythic") {
        rewardMoney += Math.floor(Math.random() * 40000) + 15000;
        rewardExp += Math.floor(Math.random() * 3000) + 1000;
        rewardPotion += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.4) rewardGold += 2;
        if (Math.random() < 0.2) rewardDiamond += 1;
      } else if (crateType === "legendary") {
        rewardMoney += Math.floor(Math.random() * 100000) + 30000;
        rewardExp += Math.floor(Math.random() * 8000) + 2500;
        rewardPotion += Math.floor(Math.random() * 3) + 2;
        rewardGold += Math.floor(Math.random() * 3) + 1;
        if (Math.random() < 0.5) rewardDiamond += Math.floor(Math.random() * 2) + 1;
      }
    }

    user.money = (user.money || 0) + rewardMoney;
    user.exp = (user.exp || 0) + rewardExp;
    if (rewardPotion > 0) user.potion = (user.potion || 0) + rewardPotion;
    if (rewardGold > 0) user.gold = (user.gold || 0) + rewardGold;
    if (rewardDiamond > 0) user.diamond = (user.diamond || 0) + rewardDiamond;

    await db.write();

    let resultMsg =
      `🎉 *MEMBUKA ${count} ${crateType.toUpperCase()} CRATE!*\n\n` +
      `💰 Money: +Rp ${rewardMoney.toLocaleString("id-ID")}\n` +
      `✨ EXP: +${rewardExp}\n`;

    if (rewardPotion > 0) resultMsg += `🧴 Potion: +${rewardPotion}\n`;
    if (rewardGold > 0) resultMsg += `🪙 Gold: +${rewardGold}\n`;
    if (rewardDiamond > 0) resultMsg += `💎 Diamond: +${rewardDiamond}\n`;

    resultMsg += `\n💳 Total Uang Kamu: Rp ${user.money.toLocaleString("id-ID")}`;

    await m.reply(resultMsg);
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
