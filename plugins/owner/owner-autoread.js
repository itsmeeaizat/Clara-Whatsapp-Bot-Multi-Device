// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Auto Read — Otomatis read semua pesan masuk
 * .autoread on/off — Toggle
 * .autoread status — Cek status
 */
import config from "../../config.js";

const STATE = { enabled: true };

function isOwner(m) {
  return config.owner?.numbers?.some(
    (n) => m.sender?.startsWith(n) || m.sender === n + "@s.whatsapp.net"
  ) || false;
}

async function handler(m, { sock, db }) {
  const command = m.command;
  const args = (m.text || "").toLowerCase().trim();
  const owner = isOwner(m);

  if (command === "autoread") {
    if (!owner) return m.reply("❌ Owner only");
    if (args === "on" || args === "enable") {
      STATE.enabled = true;
      if (db?.setting) db.setting("autoRead", true);
      return m.reply("✅ *Auto Read* aktif — Semua pesan akan di-read otomatis.");
    }
    if (args === "off" || args === "disable") {
      STATE.enabled = false;
      if (db?.setting) db.setting("autoRead", false);
      return m.reply("⛔ *Auto Read* dinonaktifkan.");
    }
    if (args === "status") {
      return m.reply("Auto Read: *" + (STATE.enabled ? "ON ✅" : "OFF ⛔") + "*");
    }
    return m.reply("Auto Read: *" + (STATE.enabled ? "ON ✅" : "OFF ⛔") + "*\n\n.autoread on/off — Toggle\n.autoread status — Cek status");
  }
  return { handled: false };
}

const pluginConfig = {
  name: "autoread",
  alias: ["autoread"],
  category: "owner",
  description: "Auto read semua pesan masuk",
  usage: ".autoread on/off/status",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export function isAutoReadEnabled() { return STATE.enabled; }
export default { config: pluginConfig, handler };
