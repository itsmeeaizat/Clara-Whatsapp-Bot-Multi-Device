import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "cook",
  alias: ["masak", "cooking"],
  category: "rpg",
  description: "Memasak makanan dari bahan mentah untuk memulihkan lapar",
  usage: ".cook <menu>",
  example: ".cook ikan_bakar",
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
    const menu = args[0] ? args[0].toLowerCase() : null;

    if (!menu) {
      let txt = "🍳 *MENU MASAKAN RPG*\n\n";
      txt += "1. *ikan_bakar* (.cook ikan_bakar)\n";
      txt += "   Bahan: 2 Ikan (" + (user.fish || 0) + "/2)\n\n";
      txt += "2. *sup_buah* (.cook sup_buah)\n";
      txt += "   Bahan: 2 Pisang (" + (user.pisang || 0) + "/2) & 2 Apel (" + (user.apel || 0) + "/2)\n\n";
      txt += "🍖 Makanan Siap Saji Milikmu: *" + (user.makanan || 0) + "* porsi";
      return await m.reply(txt);
    }

    if (menu === "ikan_bakar") {
      if ((user.fish || 0) < 2) {
        return await m.reply("❌ Ikanmu tidak cukup! Butuh 2 ikan, kamu punya *" + (user.fish || 0) + "*.");
      }
      user.fish -= 2;
      user.makanan = (user.makanan || 0) + 1;
      await db.write();
      return await m.reply("🍳 *MASAK BERHASIL!*\n\nKamu memasak *Ikan Bakar* lezat! Dapatkan 1 Makanan Siap Saji. Total makanan: *" + user.makanan + "*.");
    }

    if (menu === "sup_buah") {
      if ((user.pisang || 0) < 2 || (user.apel || 0) < 2) {
        return await m.reply("❌ Buahmu tidak cukup! Butuh 2 pisang & 2 apel.");
      }
      user.pisang -= 2;
      user.apel -= 2;
      user.makanan = (user.makanan || 0) + 1;
      await db.write();
      return await m.reply("🍳 *MASAK BERHASIL!*\n\nKamu memasak *Sup Buah* segar! Dapatkan 1 Makanan Siap Saji. Total makanan: *" + user.makanan + "*.");
    }

    return await m.reply("❌ Menu tidak ditemukan! Gunakan .cook untuk melihat daftar menu.");
  } catch (err) {
    await m.reply("❌ Terjadi kesalahan: " + String(err.message).slice(0, 100));
  }
}

export default { config: pluginConfig, handler };
