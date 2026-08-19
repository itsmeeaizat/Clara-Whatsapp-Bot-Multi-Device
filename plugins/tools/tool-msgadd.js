// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Tool Add Stored Message
 * Usage: .msgadd <key> <value>
 */

const pluginConfig = {
  name: "msgadd",
  alias: ["addmsg", "savemsg"],
  category: "tools",
  description: "Add stored message. Usage: .msgadd <key> <value>",
  usage: ".msgadd <key> <value>",
  example: ".msgadd halo Selamat datang!",
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
    return m.reply(
      `📌 *Penggunaan:* ${prefix}msgadd <key> <value>\n` +
      `Atau reply pesan dengan: ${prefix}msgadd <key>\n\n` +
      `Contoh: ${prefix}msgadd info Ini adalah pesan info`
    );
  }

  const value = m.args?.slice(1).join(" ") || m.quoted?.text;
  if (!value) {
    return m.reply(`❌ Masukkan teks atau reply pesan yang ingin disimpan dengan kata kunci *${key}*!`);
  }

  if (!db.data.msgs) db.data.msgs = {};

  if (db.data.msgs[key] && db.data.msgs[key].locked) {
    return m.reply(`🔒 Pesan dengan kata kunci *${key}* telah dikunci dan tidak bisa diubah!`);
  }

  db.data.msgs[key] = {
    text: value,
    locked: false,
    creator: m.sender,
    createdAt: new Date().toISOString(),
  };

  await db.write();

  return m.reply(`✅ Pesan dengan kata kunci *${key}* berhasil disimpan!\n\nGunakan *${prefix}msglist* untuk melihat daftar pesan.`);
}

export default { config: pluginConfig, handler };
