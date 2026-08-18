/**
 * Tool Lock Stored Message
 * Usage: .msglock <key>
 */

const pluginConfig = {
  name: "msglock",
  alias: ["lockmsg"],
  category: "tools",
  description: "Lock stored message",
  usage: ".msglock <key>",
  example: ".msglock info",
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
    return m.reply(`📌 *Penggunaan:* ${prefix}msglock <key>\nContoh: ${prefix}msglock info`);
  }

  if (!db.data.msgs || !db.data.msgs[key]) {
    return m.reply(`❌ Pesan dengan kata kunci *${key}* tidak ditemukan!`);
  }

  const isLocked = !db.data.msgs[key].locked;
  db.data.msgs[key].locked = isLocked;
  await db.write();

  if (isLocked) {
    return m.reply(`🔒 Pesan *${key}* berhasil dikunci!`);
  } else {
    return m.reply(`🔓 Kunci pesan *${key}* berhasil dibuka!`);
  }
}

export default { config: pluginConfig, handler };
