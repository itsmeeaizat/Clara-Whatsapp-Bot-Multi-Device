// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Group — Promote
 * Promote member jadi admin.
 * Usage: .promote @user
 */

const pluginConfig = {
  name: "promote",
  alias: ["promote", "admin"],
  category: "group",
  description: "Promote member jadi admin grup",
  usage: ".promote @user",
  example: ".promote @628xxx",
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
    if (!target) return m.reply("Tag orang yang mau di-promote!");

    await sock.groupParticipantsUpdate(m.chat, [target], "promote");
    await m.reply(`✅ Berhasil promote @${target.split("@")[0]} jadi admin!`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
