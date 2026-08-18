/**
 * Group — Set Bye
 * Atur custom goodbye message.
 * Usage: .setbye <teks>
 */

import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "setbye",
  alias: ["setbye", "goodbye"],
  category: "group",
  description: "Atur pesan goodbye custom untuk grup",
  usage: ".setbye <teks> (@user = nama)",
  example: ".setbye Selamat tinggal @user!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  try {
    if (!m.isGroup) return m.reply("Hanya untuk grup!");
    if (!m.isAdmin && !m.isOwner) return m.reply("Hanya admin!");

    const text = m.args?.join(" ");
    if (!text) return m.reply(`Teksnya mana?\nContoh: .setbye Selamat tinggal @user!`);

    if (!db.data.byeMsg) db.data.byeMsg = {};
    db.data.byeMsg[m.chat] = text;
    await db.write();

    await m.reply("✅ Pesan goodbye diatur!");
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
