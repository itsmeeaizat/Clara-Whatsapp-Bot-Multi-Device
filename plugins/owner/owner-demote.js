const pluginConfig = {
  name: "odemote",
  alias: ["odemote"],
  category: "owner",
  description: "Demote admin grup (akses owner)",
  usage: ".odemote @user",
  example: ".odemote @628xxx",
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
    if (!target) return m.reply("Tag atau reply orang yang mau di-demote!\nUsage: .odemote @user");

    await sock.groupParticipantsUpdate(m.chat, [target], "demote");
    await m.reply(`✅ Berhasil demote @${target.split("@")[0]} dari admin!`);
  } catch (err) {
    await m.reply(`❌ Gagal demote: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
