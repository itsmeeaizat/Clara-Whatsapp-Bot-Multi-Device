import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "shops",
  alias: ["shops", "shop", "toko"],
  category: "rpg",
  description: "Toko umum RPG untuk membeli dan menjual barang",
  usage: ".shops [buy/sell] [item] [jumlah]",
  example: ".shops buy potion 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const ITEM_PRICES = {
  potion: { buy: 20000, sell: 10000, key: "potion" },
  diamond: { buy: 100000, sell: 50000, key: "diamond" },
  gold: { buy: 30000, sell: 15000, key: "gold" },
  common: { buy: 10000, sell: 5000, key: "common" },
  uncommon: { buy: 25000, sell: 12000, key: "uncommon" },
  mythic: { buy: 75000, sell: 35000, key: "mythic" },
  legendary: { buy: 200000, sell: 100000, key: "legendary" },
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
    const action = (args && args[0] ? args[0] : "").toLowerCase();
    const item = (args && args[1] ? args[1] : "").toLowerCase();
    const count = Math.max(1, parseInt(args && args[2] ? args[2] : "1") || 1);

    if (!action || (action !== "buy" && action !== "sell" && action !== "beli" && action !== "jual")) {
      return await m.reply(
        `🏬 *TOKO ITEM GENERAL RPG*\n\n` +
        `Format: *.shops buy/sell <item> <jumlah>*\n` +
        `Contoh: *.shops buy potion 1*\n\n` +
        `🏷️ *Daftar Barang & Harga:*\n` +
        `🧴 Potion — Beli: Rp 20.000 | Jual: Rp 10.000\n` +
        `💎 Diamond — Beli: Rp 100.000 | Jual: Rp 50.000\n` +
        `🪙 Gold — Beli: Rp 30.000 | Jual: Rp 15.000\n` +
        `📦 Common Crate — Beli: Rp 10.000 | Jual: Rp 5.000\n` +
        `🎁 Uncommon Crate — Beli: Rp 25.000 | Jual: Rp 12.000\n` +
        `🔮 Mythic Crate — Beli: Rp 75.000 | Jual: Rp 35.000\n` +
        `👑 Legendary Crate — Beli: Rp 200.000 | Jual: Rp 100.000`
      );
    }

    const itemData = ITEM_PRICES[item];
    if (!itemData) {
      return await m.reply(`❌ Item *${item}* tidak tersedia di toko! Pilih dari daftar toko.`);
    }

    if (action === "buy" || action === "beli") {
      const totalPrice = itemData.buy * count;
      if ((user.money || 0) < totalPrice) {
        return await m.reply(`❌ Uang kamu tidak cukup! Butuh Rp ${totalPrice.toLocaleString("id-ID")}`);
      }

      user.money = (user.money || 0) - totalPrice;
      user[itemData.key] = (user[itemData.key] || 0) + count;
      await db.write();

      return await m.reply(
        `🛒 *BERHASIL MEMBELI ITEM!*\n\n` +
        `🛍️ Item: +${count} ${item}\n` +
        `💸 Total Harga: Rp ${totalPrice.toLocaleString("id-ID")}\n` +
        `💳 Sisa Uang Kamu: Rp ${user.money.toLocaleString("id-ID")}`
      );
    }

    if (action === "sell" || action === "jual") {
      if ((user[itemData.key] || 0) < count) {
        return await m.reply(`❌ Stok *${item}* kamu tidak cukup! (Stok: ${user[itemData.key] || 0})`);
      }

      const totalPrice = itemData.sell * count;
      user[itemData.key] -= count;
      user.money = (user.money || 0) + totalPrice;
      await db.write();

      return await m.reply(
        `💰 *BERHASIL MENJUAL ITEM!*\n\n` +
        `📦 Item: ${count} ${item}\n` +
        `💵 Total Hasil: +Rp ${totalPrice.toLocaleString("id-ID")}\n` +
        `💳 Total Uang Kamu: Rp ${user.money.toLocaleString("id-ID")}`
      );
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
