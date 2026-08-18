import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "repair",
  alias: ["repair", "perbaiki"],
  category: "rpg",
  description: "Memperbaiki ketahanan peralatan/tools RPG (pickaxe, sword, armor)",
  usage: ".repair <pickaxe|sword|armor>",
  example: ".repair pickaxe",
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
    const type = (args && args[0] ? args[0] : "").toLowerCase();

    if (!type) {
      return await m.reply(
        `🛠️ *BENGKEL REPAIR PERALATAN RPG*\n\n` +
        `Pilih item yang ingin diperbaiki:\n` +
        `1. *.repair pickaxe* — Butuh: 5 Kayu, 3 Batu, 3 Besi, 1 Diamond\n` +
        `2. *.repair sword* — Butuh: 5 Kayu, 9 Besi, 1 Diamond\n` +
        `3. *.repair armor* — Butuh: 15 Besi, 3 Diamond\n\n` +
        `🔧 *Status Ketahanan Saat Ini:*\n` +
        `⛏️ Pickaxe: ${user.pickaxedurability || 100}/100\n` +
        `⚔️ Sword: ${user.sworddurability || 100}/100\n` +
        `🛡️ Armor: ${user.armordurability || 100}/100`
      );
    }

    if (type === "pickaxe") {
      if ((user.pickaxedurability || 100) >= 100) {
        return await m.reply(`⛏️ Pickaxe kamu masih dalam kondisi sempurna (100%)!`);
      }
      if ((user.wood || 0) < 5 || (user.stone || 0) < 3 || (user.iron || 0) < 3 || (user.diamond || 0) < 1) {
        return await m.reply(`❌ Bahan tidak cukup! Butuh 5 Kayu 🪵, 3 Batu 🪨, 3 Besi ⚙️, dan 1 Diamond 💎.`);
      }

      user.wood -= 5;
      user.stone -= 3;
      user.iron -= 3;
      user.diamond -= 1;
      user.pickaxedurability = 100;
      await db.write();

      return await m.reply(`✅ *BERHASIL REPAIR!* Pickaxe kamu kembali 100% baru! ⛏️`);
    }

    if (type === "sword") {
      if ((user.sworddurability || 100) >= 100) {
        return await m.reply(`⚔️ Sword kamu masih dalam kondisi sempurna (100%)!`);
      }
      if ((user.wood || 0) < 5 || (user.iron || 0) < 9 || (user.diamond || 0) < 1) {
        return await m.reply(`❌ Bahan tidak cukup! Butuh 5 Kayu 🪵, 9 Besi ⚙️, dan 1 Diamond 💎.`);
      }

      user.wood -= 5;
      user.iron -= 9;
      user.diamond -= 1;
      user.sworddurability = 100;
      await db.write();

      return await m.reply(`✅ *BERHASIL REPAIR!* Sword kamu kembali 100% tajam! ⚔️`);
    }

    if (type === "armor") {
      if ((user.armordurability || 100) >= 100) {
        return await m.reply(`🛡️ Armor kamu masih dalam kondisi sempurna (100%)!`);
      }
      if ((user.iron || 0) < 15 || (user.diamond || 0) < 3) {
        return await m.reply(`❌ Bahan tidak cukup! Butuh 15 Besi ⚙️ dan 3 Diamond 💎.`);
      }

      user.iron -= 15;
      user.diamond -= 3;
      user.armordurability = 100;
      await db.write();

      return await m.reply(`✅ *BERHASIL REPAIR!* Armor kamu kembali 100% kokoh! 🛡️`);
    }

    return await m.reply(`❌ Item tidak dikenal. Ketik *.repair* untuk melihat daftar item.`);
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
