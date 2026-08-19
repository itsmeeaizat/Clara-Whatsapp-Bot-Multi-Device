// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Store — List
 * Tampilkan semua item di store.
 * Usage: .list
 */

import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "liststore",
  alias: ["list", "store", "tokolist"],
  category: "store",
  description: "Tampilkan semua item di store grup",
  usage: ".liststore",
  example: ".liststore",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  try {
    if (!db.data.store || !Array.isArray(db.data.store)) {
      db.data.store = [];
    }

    const items = db.data.store.filter(s => s.store === m.chat);
    if (items.length === 0) {
      return m.reply("Store masih kosong. Tambahkan dengan .addlist");
    }

    let txt = `🛍️ *STORE LIST*\n━━━━━━━━━━━━━━━━━\n`;
    items.forEach((item, i) => {
      txt += `\n${i + 1}. 📦 *${item.name}*\n`;
      txt += `   💰 Rp ${item.price.toLocaleString("id-ID")}\n`;
      if (item.desc) txt += `   📝 ${item.desc}\n`;
    });
    txt += `\n━━━━━━━━━━━━━━━━━\nUntuk pesan, ketik .order <nomor>`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
