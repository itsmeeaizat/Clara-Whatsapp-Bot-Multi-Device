const pluginConfig = {
  name: "oadd",
  alias: ["oadd"],
  category: "owner",
  description: "Tambah user ke grup (akses owner)",
  usage: ".oadd <nomor>",
  example: ".oadd 628311880113",
  isOwner: true,
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

    const rawInput =
      m.mentionedJid?.[0] ||
      m.quoted?.sender ||
      (m.text ? m.text.replace(/[^0-9]/g, "") : null);

    if (!rawInput) {
      return m.reply("❌ Tag, reply, atau masukkan nomor user yang ingin ditambahkan!\nUsage: .oadd 628xxx");
    }

    const cleanNum = rawInput.replace(/[^0-9]/g, "");
    const targetJid = cleanNum + "@s.whatsapp.net";

    await sock.groupParticipantsUpdate(m.chat, [targetJid], "add");
    await m.reply(`✅ Berhasil menambahkan @${cleanNum} ke grup!`, null, { mentions: [targetJid] });
  } catch (err) {
    await m.reply(`❌ Gagal menambahkan member: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
