// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Tool List Stored Messages
 * Usage: .msglist
 */

const pluginConfig = {
  name: "msglist",
  alias: ["listmsg", "msgs"],
  category: "tools",
  description: "List stored messages",
  usage: ".msglist",
  example: ".msglist",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { db }) {
  const msgs = db.data.msgs || {};
  const keys = Object.keys(msgs);

  if (keys.length === 0) {
    return m.reply("📜 Belum ada pesan tersimpan.\nGunakan .msgadd <key> <value> untuk menyimpan pesan.");
  }

  let text = `📜 *Daftar Pesan Tersimpan* (${keys.length})\n━━━━━━━━━━━━━━━━━\n`;
  keys.forEach((key, index) => {
    const lockStatus = msgs[key].locked ? "🔒" : "🔓";
    text += `${index + 1}. *${key}* ${lockStatus}\n`;
  });
  text += `━━━━━━━━━━━━━━━━━\nGunakan .msgdel <key> untuk menghapus pesan.`;

  return m.reply(text);
}

export default { config: pluginConfig, handler };
