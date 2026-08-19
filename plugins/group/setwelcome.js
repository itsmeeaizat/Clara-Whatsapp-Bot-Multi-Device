// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Group — Set Welcome & Set Bye
 * Atur custom welcome/goodbye message untuk grup.
 * Usage: .setwelcome <teks>
 * Usage: .setbye <teks>
 */

import db from "../../src/lib/clara-db.js";

const welcomeConfig = {
  name: "setwelcome",
  alias: ["setwelcome", "welcome"],
  category: "group",
  description: "Atur pesan welcome custom untuk grup",
  usage: ".setwelcome <teks> (@user = nama, @subject = nama grup)",
  example: ".setwelcome Selamat datang @user di @subject!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function welcomeHandler(m) {
  try {
    if (!m.isGroup) return m.reply("Hanya untuk grup!");
    if (!m.isAdmin && !m.isOwner) return m.reply("Hanya admin!");

    const text = m.args?.join(" ");
    if (!text) return m.reply(`Teksnya mana?\nContoh: .setwelcome Selamat datang @user di @subject!`);

    if (!db.data.welcomeMsg) db.data.welcomeMsg = {};
    db.data.welcomeMsg[m.chat] = text;
    await db.write();

    await m.reply("✅ Pesan welcome diatur! Preview:\n\n" + text.replace(/@user/g, m.pushName).replace(/@subject/g, m.groupName || "Grup"));
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: welcomeConfig, handler: welcomeHandler };
