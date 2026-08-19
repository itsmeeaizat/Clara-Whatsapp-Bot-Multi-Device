// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "tomoney",
  alias: ["tomoney", "exptomoney"],
  category: "rpg",
  description: "Menukarkan EXP RPG menjadi uang tunai (2 EXP = Rp 1)",
  usage: ".tomoney <jumlah_exp|all>",
  example: ".tomoney 1000",
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
    const input = (args && args[0] ? args[0] : "").toLowerCase();

    if (!input) {
      return await m.reply(
        `💱 *PENUKARAN EXP KE UANG*\n\n` +
        `Rate: *2 EXP = Rp 1*\n` +
        `✨ EXP Kamu Saat Ini: *${user.exp || 0}*\n\n` +
        `Contoh Penggunaan:\n` +
        `• *.tomoney 1000* (Menukar 1,000 EXP jadi Rp 500)\n` +
        `• *.tomoney all* (Menukar seluruh EXP)`
      );
    }

    let expToConvert = 0;
    if (input === "all") {
      expToConvert = user.exp || 0;
    } else {
      expToConvert = parseInt(input) || 0;
    }

    if (expToConvert <= 0) {
      return await m.reply(`❌ Masukkan jumlah EXP yang valid!`);
    }

    if ((user.exp || 0) < expToConvert) {
      return await m.reply(`❌ EXP kamu tidak cukup! (Punya: ${user.exp || 0}, Diminta: ${expToConvert})`);
    }

    const moneyEarned = Math.floor(expToConvert / 2);
    if (moneyEarned <= 0) {
      return await m.reply(`❌ Minimal penukaran adalah 2 EXP (mendapatkan Rp 1).`);
    }

    user.exp -= expToConvert;
    user.money = (user.money || 0) + moneyEarned;
    await db.write();

    await m.reply(
      `💸 *PENUKARAN EXP BERHASIL!*\n\n` +
      `✨ EXP Didebet: *-${expToConvert} EXP*\n` +
      `💰 Uang Diperoleh: *+Rp ${moneyEarned.toLocaleString("id-ID")}*\n` +
      `✨ Sisa EXP: *${user.exp}*\n` +
      `💳 Total Uang Kamu: *Rp ${user.money.toLocaleString("id-ID")}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
