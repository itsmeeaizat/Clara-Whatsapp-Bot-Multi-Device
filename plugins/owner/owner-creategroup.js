const pluginConfig = {
  name: "creategroup",
  alias: ["creategroup"],
  category: "owner",
  description: "Buat grup WhatsApp baru",
  usage: ".creategroup <name>",
  example: ".creategroup Grup Baru",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const name = (m.text || "").trim();
    if (!name) {
      return m.reply("❌ Masukkan nama grup yang mau dibuat!\nUsage: .creategroup <name>");
    }

    const group = await sock.groupCreate(name, [m.sender]);
    let inviteCode = "";
    try {
      inviteCode = await sock.groupInviteCode(group.id);
    } catch {}

    const link = inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : "-";
    await m.reply(`🎉 *Grup Berhasil Dibuat!*\n\n◦ Nama: ${name}\n◦ ID: ${group.id}\n◦ Link: ${link}`);
  } catch (err) {
    await m.reply(`❌ Gagal membuat grup: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
