// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours} jam ${minutes} menit ${seconds} detik`;
}

const pluginConfig = {
  name: "berdagang",
  alias: ["dagang", "trade"],
  category: "rpg",
  description: "Berdagang untuk mendapatkan keuntungan atau mengalami kerugian modal",
  usage: ".berdagang [modal]",
  example: ".berdagang 5000",
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
    const cooldownTime = 15 * 60 * 1000; // 15 menit
    const now = Date.now();
    const lastTrade = user.lastdagang || 0;

    if (now - lastTrade < cooldownTime) {
      const remaining = cooldownTime - (now - lastTrade);
      return await m.reply(`⚠️ Kamu baru saja berdagang. Tunggu *${msToTime(remaining)}* lagi sebelum berdagang kembali!`);
    }

    let modal = parseInt(args[0]);
    if (isNaN(modal) || modal < 1000) {
      modal = 5000;
    }

    if ((user.money || 0) < modal) {
      return await m.reply(`❌ Uang kamu tidak cukup untuk modal berdagang! Dibutuhkan minimal *Rp ${modal.toLocaleString("id-ID")}*, sedangkan kamu hanya punya *Rp ${(user.money || 0).toLocaleString("id-ID")}*.`);
    }

    const isProfit = Math.random() > 0.35; // 65% chance profit
    let resultMoney = 0;
    let expGained = Math.floor(Math.random() * 100) + 50;

    if (isProfit) {
      const profitRate = 0.2 + Math.random() * 0.8; // 20% - 100%
      resultMoney = Math.floor(modal * profitRate);
      user.money = (user.money || 0) + resultMoney;
      user.exp = (user.exp || 0) + expGained;
      user.lastdagang = now;
      await db.write();

      await m.reply(
        `📈 *BERDAGANG SUKSES!*

` +
        `💰 Modal: *Rp ${modal.toLocaleString("id-ID")}*
` +
        `🎉 Keuntungan: *+Rp ${resultMoney.toLocaleString("id-ID")}*
` +
        `✨ EXP: *+${expGained}*
` +
        `💳 Total Uang: *Rp ${(user.money).toLocaleString("id-ID")}*`
      );
    } else {
      const lossRate = 0.1 + Math.random() * 0.4; // 10% - 50%
      resultMoney = Math.floor(modal * lossRate);
      user.money = Math.max(0, (user.money || 0) - resultMoney);
      user.lastdagang = now;
      await db.write();

      await m.reply(
        `📉 *BERDAGANG RUGI!*

` +
        `💰 Modal: *Rp ${modal.toLocaleString("id-ID")}*
` +
        `💸 Kerugian: *-Rp ${resultMoney.toLocaleString("id-ID")}*
` +
        `💳 Sisa Uang: *Rp ${(user.money).toLocaleString("id-ID")}*`
      );
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
