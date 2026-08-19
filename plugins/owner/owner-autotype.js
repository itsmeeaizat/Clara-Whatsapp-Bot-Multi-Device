// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Auto Type — Otomatis show typing indicator
 * .autotype on/off — Toggle
 * .autotype status — Cek status
 */
import config from "../../config.js";

const STATE = { enabled: false };

function isOwner(m) {
  return config.owner?.numbers?.some(
    (n) => m.sender?.startsWith(n) || m.sender === n + "@s.whatsapp.net"
  ) || false;
}

async function handler(m, { sock, db }) {
  const command = m.command;
  const args = (m.text || "").toLowerCase().trim();
  const owner = isOwner(m);

  if (command === "autotype") {
    if (!owner) return m.reply("❌ Owner only");
    if (args === "on" || args === "enable") {
      STATE.enabled = true;
      if (db?.setting) db.setting("autoType", true);
      return m.reply("✅ *Auto Type* aktif — Bot akan show typing indicator.");
    }
    if (args === "off" || args === "disable") {
      STATE.enabled = false;
      if (db?.setting) db.setting("autoType", false);
      return m.reply("⛔ *Auto Type* dinonaktifkan.");
    }
    if (args === "status") {
      return m.reply("Auto Type: *" + (STATE.enabled ? "ON ✅" : "OFF ⛔") + "*");
    }
    return m.reply("Auto Type: *" + (STATE.enabled ? "ON ✅" : "OFF ⛔") + "*\n\n.autotype on/off — Toggle\n.autotype status — Cek status");
  }
  return { handled: false };
}

const pluginConfig = {
  name: "autotype",
  alias: ["autotype", "autotyping"],
  category: "owner",
  description: "Auto typing indicator saat pesan masuk",
  usage: ".autotype on/off/status",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export function isAutoTypeEnabled() { return STATE.enabled; }
export default { config: pluginConfig, handler };
