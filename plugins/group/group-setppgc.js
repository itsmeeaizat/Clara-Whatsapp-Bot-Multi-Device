/**
 * Group — Set Group PP
 * Mengubah foto profil grup.
 * Usage: .setppgc (reply gambar)
 */

const pluginConfig = {
  name: "setppgc",
  alias: ["setppgc", "setppgroup", "setppgrup", "gantippgc"],
  category: "group",
  description: "Mengubah foto profil grup (reply gambar)",
  usage: ".setppgc (reply gambar)",
  example: ".setppgc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!m.isGroup) return m.reply("Command ini hanya untuk grup!");
    if (!m.isAdmin && !m.isOwner) return m.reply("Command ini hanya untuk admin!");

    const quoted = m.quoted;
    const isQuotedImg = quoted && /image/.test(quoted.mimetype || quoted.msg?.mimetype || "");
    const isImg = /image/.test(m.mimetype || m.msg?.mimetype || "");

    if (!isQuotedImg && !isImg) {
      return m.reply("Reply atau kirim gambar dengan caption .setppgc!");
    }

    await m.reply("⏳ Memproses penggantian foto profil grup...");

    const targetMedia = isQuotedImg ? quoted : m;
    const buffer = await targetMedia.download();
    if (!buffer || buffer.length === 0) {
      return m.reply("❌ Gagal mengunduh gambar!");
    }

    await sock.updateProfilePicture(m.chat, buffer);
    await m.reply("✅ Berhasil memperbarui foto profil grup!");
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
