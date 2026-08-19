// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "shopfish",
  alias: ["tokoikan", "jualikan", "sellfish"],
  category: "rpg",
  description: "Membeli atau menjual ikan hasil tangkapan",
  usage: ".shopfish [sell/buy] [jumlah]",
  example: ".shopfish sell all",
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
    const action = args[0] ? args[0].toLowerCase() : null;
    const qtyArg = args[1] ? args[1].toLowerCase() : "1";

    const sellPrice = 350;
    const buyPrice = 500;

    if (!action || !["sell", "buy"].includes(action)) {
      return await m.reply(
        `🏪 *TOKO PASAR IKAN (SHOPFISH)*

` +
        `💵 Harga Jual: *Rp ${sellPrice}* / ekor (.shopfish sell 10 / .shopfish sell all)
` +
        `🛒 Harga Beli: *Rp ${buyPrice}* / ekor (.shopfish buy 5)

` +
        `🐟 Stok Ikan Milikmu: *${user.fish || 0}* ekor
` +
        `💳 Uang Milikmu: *Rp ${(user.money || 0).toLocaleString("id-ID")}*`
      );
    }

    if (action === "sell") {
      let count = 0;
      if (qtyArg === "all") {
        count = user.fish || 0;
      } else {
        count = parseInt(qtyArg);
      }

      if (isNaN(count) || count <= 0) {
        return await m.reply("❌ Jumlah ikan yang dijual tidak valid!");
      }

      if ((user.fish || 0) < count) {
        return await m.reply(`❌ Kamu hanya memiliki *${user.fish || 0}* ekor ikan!`);
      }

      const totalEarnings = count * sellPrice;
      user.fish -= count;
      user.money = (user.money || 0) + totalEarnings;

      await db.write();

      return await m.reply(
        `💰 *BERHASIL MENJUAL IKAN!*

` +
        `🐟 Ikan Dijual: *${count}* ekor
` +
        `💵 Hasil: *+Rp ${totalEarnings.toLocaleString("id-ID")}*
` +
        `💳 Total Saldo: *Rp ${user.money.toLocaleString("id-ID")}*`
      );
    }

    if (action === "buy") {
      const count = parseInt(qtyArg);
      if (isNaN(count) || count <= 0) {
        return await m.reply("❌ Jumlah ikan yang dibeli tidak valid!");
      }

      const totalPrice = count * buyPrice;
      if ((user.money || 0) < totalPrice) {
        return await m.reply(`❌ Saldomu tidak cukup! Dibutuhkan *Rp ${totalPrice.toLocaleString("id-ID")}*.`);
      }

      user.money -= totalPrice;
      user.fish = (user.fish || 0) + count;

      await db.write();

      return await m.reply(
        `🛒 *BERHASIL MEMBELI IKAN!*

` +
        `🐟 Ikan Dibeli: *${count}* ekor
` +
        `💸 Total Biaya: *-Rp ${totalPrice.toLocaleString("id-ID")}*
` +
        `📦 Total Ikan: *${user.fish}* ekor`
      );
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
