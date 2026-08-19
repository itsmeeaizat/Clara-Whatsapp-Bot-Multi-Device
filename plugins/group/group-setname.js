// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Group — Set Group Name
 * Mengubah nama/subjek grup.
 * Usage: .setname <teks>
 */

const pluginConfig = {
  name: "setname",
  alias: ["setname", "setgroupname", "setnamagrup", "gsetname"],
  category: "group",
  description: "Mengubah nama/subjek grup",
  usage: ".setname <teks>",
  example: ".setname Clara Community",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!m.isGroup) return m.reply("Command ini hanya untuk grup!");
    if (!m.isAdmin && !m.isOwner) return m.reply("Command ini hanya untuk admin!");

    const text = m.args?.join(" ") || (m.text ? m.text.trim() : "");
    if (!text) return m.reply("Masukkan nama baru untuk grup!\nContoh: .setname Clara Community");
    if (text.length > 100) return m.reply("Nama grup terlalu panjang (maksimal 100 karakter)!");

    await sock.groupUpdateSubject(m.chat, text);
    await m.reply(`✅ Berhasil mengubah nama grup menjadi:\n*${text}*`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
