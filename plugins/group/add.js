/**
 * Group — Add Member
 * Tambah member ke grup.
 * Usage: .add <nomor>
 */

const pluginConfig = {
  name: "add",
  alias: ["add", "tambah", "invite"],
  category: "group",
  description: "Tambah member ke grup",
  usage: ".add <nomor>",
  example: ".add 628xxx",
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

    let num = m.args?.join("").replace(/[^0-9]/g, "");
    if (!num) {
      const target = m.mentionedJid?.[0] || m.quoted?.sender;
      if (!target) return m.reply("Masukkan nomor atau tag orang!\nContoh: .add 628xxx");
      num = target.split("@")[0];
    }

    const jid = num + "@s.whatsapp.net";
    const result = await sock.groupParticipantsUpdate(m.chat, [jid], "add");

    if (result[0]?.status === "200") {
      await m.reply(`✅ Berhasil menambahkan @${num}`);
    } else {
      const statusMsg = {
        "403": "❌ Target mengaktifkan privacy settings",
        "408": "❌ Target baru saja keluar dari grup",
        "409": "❌ Target sudah ada di grup",
        "500": "❌ Grup penuh",
      };
      await m.reply(statusMsg[result[0]?.status] || `❌ Gagal menambahkan (status: ${result[0]?.status})`);
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
