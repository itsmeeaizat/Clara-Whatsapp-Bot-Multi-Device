import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "antitoxic",
  alias: ["antitoxic"],
  category: "main",
  description: "Toggle anti-toxic kata kasar di grup",
  usage: ".antitoxic on/off",
  example: ".antitoxic on",
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
    db.data.groups[m.chat].antitoxic = status;
    await db.write();
    await m.reply(`✅ Fitur Anti-Toxic grup telah di-${status ? "aktifkan (ON)" : "nonaktifkan (OFF)"}.`);
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
