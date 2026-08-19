// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "pasar",
  alias: ["pasar", "market"],
  category: "rpg",
  description: "Pasar RPG untuk jual beli hasil bumi, tambang, dan tangkapan",
  usage: ".pasar [jual/beli] [item] [jumlah]",
  example: ".pasar jual kayu 10",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const MARKET_PRICES = {
  kayu: { sell: 300, buy: 500 },
  batu: { sell: 400, buy: 700 },
  besi: { sell: 1500, buy: 2500 },
  emas: { sell: 8000, buy: 12000 },
  diamond: { sell: 25000, buy: 40000 },
  ikan: { sell: 1000, buy: 1800 },
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

    if (!action || (action !== "jual" && action !== "beli")) {
      return await m.reply(
        `🏛️ *PASAR TRADISIONAL RPG*\n\n` +
        `Cara Penggunaan:\n` +
        `• *.pasar jual <item> <jumlah>*\n` +
        `• *.pasar beli <item> <jumlah>*\n\n` +
        `📊 *Daftar Harga Pasar:*\n` +
        `🪵 Kayu — Jual: Rp 300 | Beli: Rp 500\n` +
        `🪨 Batu — Jual: Rp 400 | Beli: Rp 700\n` +
        `⚙️ Besi (iron) — Jual: Rp 1.500 | Beli: Rp 2.500\n` +
        `🪙 Emas (gold) — Jual: Rp 8.000 | Beli: Rp 12.000\n` +
        `💎 Diamond — Jual: Rp 25.000 | Beli: Rp 40.000\n` +
        `🐟 Ikan — Jual: Rp 1.000 | Beli: Rp 1.800`
      );
    }

    const itemMap = {
      kayu: "wood",
      batu: "stone",
      besi: "iron",
      iron: "iron",
      emas: "gold",
      gold: "gold",
      diamond: "diamond",
      ikan: "fish",
      fish: "fish",
    };

    const targetKey = itemMap[item];
    const priceInfo = MARKET_PRICES[item] || (targetKey ? MARKET_PRICES[{ wood: "kayu", stone: "batu", iron: "besi", gold: "emas", diamond: "diamond", fish: "ikan" }[targetKey]] : null);

    if (!targetKey || !priceInfo) {
      return await m.reply(`❌ Item *${item}* tidak terdaftar di pasar! Pilih: kayu, batu, besi, emas, diamond, ikan.`);
    }

    if (action === "jual") {
      if ((user[targetKey] || 0) < count) {
        return await m.reply(`❌ Stok *${item}* kamu tidak cukup untuk dijual! (Punya: ${user[targetKey] || 0})`);
      }
      const totalPrice = priceInfo.sell * count;
      user[targetKey] -= count;
      user.money = (user.money || 0) + totalPrice;
      await db.write();

      return await m.reply(
        `💰 *BERHASIL MENJUAL ITEM!*\n\n` +
        `📦 Item: ${count} ${item}\n` +
        `💵 Total Hasil: +Rp ${totalPrice.toLocaleString("id-ID")}\n` +
        `💳 Total Uang Kamu: Rp ${user.money.toLocaleString("id-ID")}`
      );
    }

    if (action === "beli") {
      const totalPrice = priceInfo.buy * count;
      if ((user.money || 0) < totalPrice) {
        return await m.reply(`❌ Uang kamu tidak cukup! Butuh Rp ${totalPrice.toLocaleString("id-ID")} (Uang kamu: Rp ${(user.money || 0).toLocaleString("id-ID")})`);
      }

      user.money = (user.money || 0) - totalPrice;
      user[targetKey] = (user[targetKey] || 0) + count;
      await db.write();

      return await m.reply(
        `🛒 *BERHASIL MEMBELI ITEM!*\n\n` +
        `📦 Item: +${count} ${item}\n` +
        `💸 Total Bayar: Rp ${totalPrice.toLocaleString("id-ID")}\n` +
        `💳 Sisa Uang Kamu: Rp ${user.money.toLocaleString("id-ID")}`
      );
    }
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
