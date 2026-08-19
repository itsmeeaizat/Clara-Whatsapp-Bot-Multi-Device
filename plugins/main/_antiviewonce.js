// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "antiviewonce",
  alias: ["antiviewonce", "viewonce"],
  category: "main",
  description: "Toggle anti view-once di grup (admin only)",
  usage: ".antiviewonce on/off",
  example: ".antiviewonce on",
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
    db.data.groups[m.chat].antiviewonce = status;
    await db.write();
    await m.reply(`✅ Fitur Anti View-Once grup telah di-${status ? "aktifkan (ON)" : "nonaktifkan (OFF)"}.`);
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
