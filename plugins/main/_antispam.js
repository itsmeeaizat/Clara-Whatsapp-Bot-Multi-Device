// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "antispam",
  alias: ["antispam"],
  category: "main",
  description: "Toggle anti-spam di grup",
  usage: ".antispam on/off",
  example: ".antispam on",
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

    const text = (m.args?.[0] || m.text || "").trim().toLowerCase();
    if (!["on", "off"].includes(text)) {
      return m.reply(`Usage: ${pluginConfig.usage} (admin only)\nContoh: ${pluginConfig.example}`);
    }
    const status = text === "on";
    if (!db.data.groups) db.data.groups = {};
    if (!db.data.groups[m.chat]) db.data.groups[m.chat] = {};
    db.data.groups[m.chat].antispam = status;
    await db.write();
    await m.reply(`✅ Fitur Anti-Spam grup telah di-${status ? "aktifkan (ON)" : "nonaktifkan (OFF)"}.`);
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
