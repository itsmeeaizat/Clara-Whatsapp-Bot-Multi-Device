/**
 * Store — Delete List
 * Hapus item dari list store.
 * Usage: .dellist <nomor>
 */

import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "dellist",
  alias: ["delstore", "hapuslist"],
  category: "store",
  description: "Hapus item dari list store",
  usage: ".dellist <nomor>",
  example: ".dellist 1",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const num = parseInt(m.args?.[0]);
  if (!num || num < 1) {
    return m.reply(`Nomor itemnya mana?\nContoh: ${m.prefix || "."}dellist 1`);
  }

  try {
    if (!db.data.store || !Array.isArray(db.data.store)) {
      return m.reply("Store masih kosong.");
    }

    const storeItems = db.data.store.filter(s => s.store === m.chat);
    if (num > storeItems.length) {
      return m.reply(`Item nomor ${num} tidak ditemukan. Total item: ${storeItems.length}`);
    }

    const target = storeItems[num - 1];
    const idx = db.data.store.indexOf(target);
    db.data.store.splice(idx, 1);
    await db.write();

    await m.reply(`✅ Item dihapus: ${target.name}`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
