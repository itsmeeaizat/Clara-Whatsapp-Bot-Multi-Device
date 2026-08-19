// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "anticall",
  alias: ["anticall"],
  category: "main",
  description: "Toggle fitur anti-call (tolak semua panggilan masuk)",
  usage: ".anticall on/off",
  example: ".anticall on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const text = (m.args?.[0] || m.text || "").trim().toLowerCase();
    if (!["on", "off"].includes(text)) {
      return m.reply(`Usage: ${pluginConfig.usage}\nContoh: ${pluginConfig.example}`);
    }
    const status = text === "on";
    if (!db.data.settings) db.data.settings = {};
    db.data.settings.anticall = status;
    await db.write();
    await m.reply(`✅ Fitur Anti-Call telah di-${status ? "aktifkan (ON)" : "nonaktifkan (OFF)"}.`);
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
