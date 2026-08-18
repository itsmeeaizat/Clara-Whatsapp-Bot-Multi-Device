/**
 * Store — Add List
 * Tambahkan produk/item ke list store.
 * Usage: .addlist <nama> | <harga> | <deskripsi>
 */

import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "addlist",
  alias: ["addstore", "tambahlist"],
  category: "store",
  description: "Tambahkan item ke list store",
  usage: ".addlist <nama> | <harga> | <deskripsi>",
  example: ".addlist Pulsa 10k | 10000 | Pulsa semua operator",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const text = m.args?.join(" ") || "";
  const parts = text.split("|").map(s => s.trim());
  if (parts.length < 2) {
    return m.reply(`Format salah!\nContoh: ${m.prefix || "."}addlist Pulsa 10k | 10000 | Pulsa semua operator`);
  }

  try {
    const item = {
      name: parts[0],
      price: parseInt(parts[1]) || 0,
      desc: parts[2] || "",
      store: m.chat,
      created: Date.now(),
    };

    if (db.data.store == null) db.data.store = [];
    db.data.store.push(item);
    await db.write();

    await m.reply(`✅ *Store item ditambahkan!*\n📦 ${item.name}\n💰 Rp ${item.price.toLocaleString("id-ID")}\n📝 ${item.desc}`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
