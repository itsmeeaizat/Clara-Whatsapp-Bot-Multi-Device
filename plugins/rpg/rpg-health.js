// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

function getBar(value, max = 100, length = 10) {
  const filled = Math.min(length, Math.max(0, Math.round((value / max) * length)));
  return "█".repeat(filled) + "░".repeat(length - filled);
}

const pluginConfig = {
  name: "health",
  alias: ["healt", "hp", "status"],
  category: "rpg",
  description: "Memeriksa status kesehatan, kelaparan, dan stamina pengguna",
  usage: ".health",
  example: ".health",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!db.data) db.data = {};
    if (!db.data.users) db.data.users = {};
    if (!db.data.users[m.sender]) {
      db.data.users[m.sender] = {
        money: 0,
        exp: 0,
        level: 1,
        health: 100,
        hunger: 50,
        stamina: 100,
      };
      await db.write();
    }

    const user = db.data.users[m.sender];
    const hp = user.health || 100;
    const hunger = user.hunger || 50;
    const stamina = user.stamina || 100;

    await m.reply(
      `📊 *STATUS KONDISI KARAKTER*

` +
      `❤️ HP: [${getBar(hp)}] *${hp}/100*
` +
      `🍗 Kelaparan: [${getBar(hunger)}] *${hunger}/100*
` +
      `⚡ Stamina: [${getBar(stamina)}] *${stamina}/100*

` +
      `🌟 Level: *${user.level || 1}* | ✨ EXP: *${user.exp || 0}*
` +
      `💰 Uang: *Rp ${(user.money || 0).toLocaleString("id-ID")}*

` +
      `💡 *Tips:* Gunakan .eat untuk memulihkan kelaparan/HP!`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
