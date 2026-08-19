// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const pluginConfig = {
  name: "opromote",
  alias: ["opromote"],
  category: "owner",
  description: "Promote member jadi admin (akses owner)",
  usage: ".opromote @user",
  example: ".opromote @628xxx",
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

    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) return m.reply("Tag atau reply orang yang mau di-promote!\nUsage: .opromote @user");

    await sock.groupParticipantsUpdate(m.chat, [target], "promote");
    await m.reply(`✅ Berhasil promote @${target.split("@")[0]} jadi admin!`);
  } catch (err) {
    await m.reply(`❌ Gagal promote: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
