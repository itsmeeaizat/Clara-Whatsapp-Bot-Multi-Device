/**
 * Anti Tag — Deteksi & blokir tag berlebihan (spam tag)
 * .antitag on/off — Toggle (admin grup)
 * .antitag limit <jumlah> — Set max tag per pesan (default 5)
 * .antitag status — Cek status
 */
import config from "../../config.js";

const groupStates = new Map();
const DEFAULT_LIMIT = 5;

function getGroupState(jid) {
  if (!groupStates.has(jid)) {
    groupStates.set(jid, { enabled: false, limit: DEFAULT_LIMIT, blocked: 0 });
  }
  return groupStates.get(jid);
}

async function handler(m, { sock, db, groupMetadata }) {
  const command = m.command;
  const args = (m.text || "").trim();
  const isGroup = m.chat?.endsWith("@g.us");

  if (command === "antitag") {
    if (!isGroup) return m.reply("❌ Hanya untuk grup!");
    
    const meta = groupMetadata || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return m.reply("❌ Gagal mendapatkan info grup.");
    const isAdmin = meta.participants?.some(p => p.id === m.sender && (p.admin === "admin" || p.admin === "superadmin"));
    const isOwner = config.owner?.numbers?.some(
      (n) => m.sender === n + "@s.whatsapp.net"
    ) || false;
    if (!isAdmin && !isOwner) return m.reply("❌ Admin/Owner only!");

    const state = getGroupState(m.chat);
    const sub = args.toLowerCase().split(" ")[0];
    const val = args.split(" ")[1];

    if (sub === "on" || sub === "enable") {
      state.enabled = true;
      if (db?.setGroupSetting) db.setGroupSetting(m.chat, "antitag", true);
      return m.reply("✅ *Anti Tag* aktif!\n\nMax tag per pesan: *" + state.limit + "*\nBerlebihan = delete + warn.");
    }
    if (sub === "off" || sub === "disable") {
      state.enabled = false;
      if (db?.setGroupSetting) db.setGroupSetting(m.chat, "antitag", false);
      return m.reply("⛔ *Anti Tag* dinonaktifkan.");
    }
    if (sub === "limit") {
      const n = parseInt(val);
      if (!n || n < 1 || n > 20) return m.reply("❌ Jumlah tidak valid! (1-20)\n\nContoh: .antitag limit 5");
      state.limit = n;
      return m.reply("✅ Max tag diatur ke *" + n + "* per pesan.");
    }
    if (sub === "status") {
      return m.reply("Anti Tag: *" + (state.enabled ? "ON ✅" : "OFF ⛔") + "*\nLimit: *" + state.limit + "* tag/pesan\nBlocked: *" + state.blocked + "* pesan");
    }
    return m.reply("Anti Tag: *" + (state.enabled ? "ON ✅" : "OFF ⛔") + "*\n\n.antitag on/off — Toggle\n.antitag limit <n> — Set max tag\n.antitag status — Cek status");
  }
  return { handled: false };
}

// Export untuk message handler
export function checkTagSpam(mentionedJids, jid) {
  const state = groupStates.get(jid);
  if (!state || !state.enabled) return { spam: false };
  if (mentionedJids && mentionedJids.length > state.limit) {
    state.blocked++;
    return { spam: true, count: mentionedJids.length, limit: state.limit };
  }
  return { spam: false };
}

const pluginConfig = {
  name: "antitag",
  alias: ["antitag", "antimention"],
  category: "group",
  description: "Anti tag berlebihan — blokir spam mention di grup",
  usage: ".antitag on/off | .antitag limit <n> | .antitag status",
  isOwner: false,
  isGroup: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
