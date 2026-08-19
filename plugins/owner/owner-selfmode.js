// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Self Mode — Bot hanya merespon owner, abaikan orang lain
 * .selfmode on/off — Toggle
 * .selfmode status — Cek status
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

  if (command === "selfmode") {
    if (!owner) return m.reply("❌ Owner only");
    if (args === "on" || args === "enable") {
      STATE.enabled = true;
      if (db?.setting) db.setting("selfMode", true);
      return m.reply("✅ *Self Mode* aktif!\n\nBot hanya akan merespon owner. Pesan dari orang lain akan diabaikan.");
    }
    if (args === "off" || args === "disable") {
      STATE.enabled = false;
      if (db?.setting) db.setting("selfMode", false);
      return m.reply("✅ *Self Mode* dinonaktifkan!\n\nBot kembali merespon semua orang (public mode).");
    }
    if (args === "status") {
      return m.reply("Self Mode: *" + (STATE.enabled ? "ON ✅ (owner only)" : "OFF ✅ (public)") + "*");
    }
    return m.reply("Self Mode: *" + (STATE.enabled ? "ON ✅ (owner only)" : "OFF ✅ (public)") + "*\n\n.selfmode on/off — Toggle\n.selfmode status — Cek status");
  }
  return { handled: false };
}

const pluginConfig = {
  name: "selfmode",
  alias: ["selfmode", "self"],
  category: "owner",
  description: "Bot hanya merespon owner, abaikan orang lain",
  usage: ".selfmode on/off/status",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export function isSelfModeEnabled() { return STATE.enabled; }
export default { config: pluginConfig, handler };
