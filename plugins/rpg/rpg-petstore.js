// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "petstore",
  alias: ["tokopet", "buypet"],
  category: "rpg",
  description: "Toko hewan peliharaan (kucing, naga, rubah, kuda)",
  usage: ".petstore [nama_pet]",
  example: ".petstore kucing",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const pets = {
  kucing: { price: 50000, icon: "🐱", name: "Kucing Lucu" },
  rubah: { price: 100000, icon: "🦊", name: "Rubah Cerdik" },
  kuda: { price: 200000, icon: "🐴", name: "Kuda Cepat" },
  naga: { price: 500000, icon: "🐉", name: "Naga Api" },
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
    const petChoice = args[0] ? args[0].toLowerCase() : null;

    if (!petChoice || !pets[petChoice]) {
      let catalog = "🐾 *KATALOG TOKO HEWAN PELIHARAAN (PETSTORE)*\n\n";
      for (const [key, val] of Object.entries(pets)) {
        catalog += val.icon + " *" + val.name + "* (.petstore " + key + ")\n   Harga: *Rp " + val.price.toLocaleString("id-ID") + "*\n\n";
      }
      catalog += "💳 Saldomu: *Rp " + (user.money || 0).toLocaleString("id-ID") + "*";
      return await m.reply(catalog);
    }

    const pet = pets[petChoice];

    if (user[petChoice]) {
      return await m.reply(`❌ Kamu sudah memiliki ${pet.name}! Kamu hanya bisa memelihara 1 ekor per jenis.`);
    }

    if ((user.money || 0) < pet.price) {
      return await m.reply(`❌ Uangmu tidak cukup untuk membeli ${pet.name}! Dibutuhkan *Rp ${pet.price.toLocaleString("id-ID")}*.`);
    }

    user.money -= pet.price;
    user[petChoice] = 1;
    user[petChoice + "_level"] = 1;
    user[petChoice + "_exp"] = 0;

    await db.write();

    await m.reply(
      `🎉 *PEMBELIAN PET BERHASIL!*

` +
      `Selamat, kamu sekarang memelihara ${pet.icon} *${pet.name}*!
` +
      `Gunakan .feed ${petChoice} untuk memberi makan pet milikmu.`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
