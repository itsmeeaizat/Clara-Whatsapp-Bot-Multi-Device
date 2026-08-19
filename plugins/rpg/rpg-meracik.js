// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "meracik",
  alias: ["meracik", "racik", "brew"],
  category: "rpg",
  description: "Meracik ramuan herbal dan potion RPG dari buah-buahan",
  usage: ".meracik <jenis>",
  example: ".meracik potion",
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
        `🧪 *MEJA MERACIK RAMUAN RPG*\n\n` +
        `Pilih ramuan yang ingin kamu buat:\n` +
        `1. *.meracik potion* — Butuh 2 Apel 🍎 & 2 Jeruk 🍊 (Hasil: +1 Potion)\n` +
        `2. *.meracik stamina* — Butuh 2 Mangga 🥭 & 2 Pisang 🍌 (Hasil: +50 Stamina)\n` +
        `3. *.meracik elixir* — Butuh 2 Anggur 🍇 & 1 Gold 🪙 (Hasil: +1000 EXP)\n\n` +
        `🎒 *Stok Buah Kamu:*\n` +
        `🍎 Apel: ${user.apel || 0} | 🍊 Jeruk: ${user.jeruk || 0}\n` +
        `🥭 Mangga: ${user.mangga || 0} | 🍌 Pisang: ${user.pisang || 0}\n` +
        `🍇 Anggur: ${user.anggur || 0} | 🪙 Gold: ${user.gold || 0}`
      );
    }

    if (type === "potion" || type === "ramuan") {
      if ((user.apel || 0) < 2 || (user.jeruk || 0) < 2) {
        return await m.reply(`❌ Bahan tidak cukup! Kamu butuh minimal 2 Apel 🍎 dan 2 Jeruk 🍊 untuk meracik Potion.`);
      }
      user.apel = (user.apel || 0) - 2;
      user.jeruk = (user.jeruk || 0) - 2;
      user.potion = (user.potion || 0) + 1;
      await db.write();
      return await m.reply(`✨ *BERHASIL MERACIK!*\n\n🧪 Kamu membuat *1 Potion* 🧴\n🔴 Sisa Apel: ${user.apel} | 🍊 Sisa Jeruk: ${user.jeruk}`);
    }

    if (type === "stamina") {
      if ((user.mangga || 0) < 2 || (user.pisang || 0) < 2) {
        return await m.reply(`❌ Bahan tidak cukup! Kamu butuh minimal 2 Mangga 🥭 dan 2 Pisang 🍌 untuk meracik Ramuan Stamina.`);
      }
      user.mangga = (user.mangga || 0) - 2;
      user.pisang = (user.pisang || 0) - 2;
      user.stamina = Math.min(100, (user.stamina || 0) + 50);
      await db.write();
      return await m.reply(`✨ *BERHASIL MERACIK!*\n\n⚡ Stamina kamu bertambah +50!\n⚡ Total Stamina: ${user.stamina}/100`);
    }

    if (type === "elixir") {
      if ((user.anggur || 0) < 2 || (user.gold || 0) < 1) {
        return await m.reply(`❌ Bahan tidak cukup! Kamu butuh minimal 2 Anggur 🍇 dan 1 Gold 🪙 untuk meracik Elixir.`);
      }
      user.anggur = (user.anggur || 0) - 2;
      user.gold = (user.gold || 0) - 1;
      user.exp = (user.exp || 0) + 1000;
      await db.write();
      return await m.reply(`✨ *BERHASIL MERACIK!*\n\n🌟 Kamu meminum Elixir dan mendapatkan *+1000 EXP*!\n✨ Total EXP: ${user.exp}`);
    }

    return await m.reply(`❌ Ramuan tidak dikenal. Ketik *.meracik* untuk melihat daftar ramuan.`);
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
