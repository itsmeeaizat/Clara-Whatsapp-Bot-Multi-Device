/**
 * Tool Delete Stored Message
 * Usage: .msgdel <key>
 */

const pluginConfig = {
  name: "msgdel",
  alias: ["delmsg", "removemsg"],
  category: "tools",
  description: "Delete stored message",
  usage: ".msgdel <key>",
  example: ".msgdel info",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { db }) {
  const prefix = m.prefix || ".";
  const key = m.args?.[0]?.toLowerCase();

  if (!key) {
    return m.reply(`📌 *Penggunaan:* ${prefix}msgdel <key>\nContoh: ${prefix}msgdel info`);
  }

  if (!db.data.msgs || !db.data.msgs[key]) {
    return m.reply(`❌ Pesan dengan kata kunci *${key}* tidak ditemukan!`);
  }

  if (db.data.msgs[key].locked) {
    return m.reply(`🔒 Pesan *${key}* dikunci! Buka kuncinya terlebih dahulu dengan *${prefix}msglock ${key}*.`);
  }

  delete db.data.msgs[key];
  await db.write();

  return m.reply(`🗑️ Pesan dengan kata kunci *${key}* berhasil dihapus!`);
}

export default { config: pluginConfig, handler };
