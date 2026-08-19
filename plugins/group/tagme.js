// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Group — Tag Me
 * Tag diri sendiri dengan invisible mention.
 * Usage: .tagme
 */

const pluginConfig = {
  name: "tagme",
  alias: ["tagme", "sticktagme"],
  category: "group",
  description: "Tag diri sendiri di grup",
  usage: ".tagme",
  example: ".tagme",
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
    const name = m.pushName || "User";
    await sock.sendMessage(m.chat, {
      text: `Tag untuk ${name}`,
      mentions: [m.sender],
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
