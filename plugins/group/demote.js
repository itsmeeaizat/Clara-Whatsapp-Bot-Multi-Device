// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Group — Demote
 * Demote admin jadi member.
 * Usage: .demote @user
 */

const pluginConfig = {
  name: "demote",
  alias: ["demote", "unadmin"],
  category: "group",
  description: "Demote admin jadi member biasa",
  usage: ".demote @user",
  example: ".demote @628xxx",
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

    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) return m.reply("Tag orang yang mau di-demote!");

    await sock.groupParticipantsUpdate(m.chat, [target], "demote");
    await m.reply(`✅ Berhasil demote @${target.split("@")[0]} dari admin!`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
