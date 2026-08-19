// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "bankcek",
  alias: ["bankcek", "bank", "cekbank"],
  category: "rpg",
  description: "Mengecek saldo bank, uang tunai, dan level ATM",
  usage: ".bankcek",
  example: ".bankcek",
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
        thirst: 50,
        stamina: 100,
        fish: 0,
        coal: 0,
        gold: 0,
        diamond: 0,
        iron: 0,
        wood: 0,
        stone: 0,
        bank: 0,
        atm: 0,
      };
      await db.write();
    }

    const user = db.data.users[m.sender];
    const atmLevel = user.atm || 0;
    const bankBalance = user.bank || 0;
    const cashMoney = user.money || 0;
    const totalWealth = bankBalance + cashMoney;

    await m.reply(
      `🏦 *INFORMASI REKENING BANK USER*\n\n` +
      `💳 *Level ATM:* ${atmLevel > 0 ? `Level ${atmLevel}` : "Belum Punya ATM"}\n` +
      `🏛️ *Saldo Bank:* Rp ${bankBalance.toLocaleString("id-ID")}\n` +
      `💵 *Uang Tunai:* Rp ${cashMoney.toLocaleString("id-ID")}\n` +
      `💎 *Total Kekayaan:* Rp ${totalWealth.toLocaleString("id-ID")}\n\n` +
      `🌟 *Status:* Free User`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
