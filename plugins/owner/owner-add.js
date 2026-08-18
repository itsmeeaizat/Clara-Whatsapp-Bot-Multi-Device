import { addOwner } from "../../src/lib/clara-premium-db.js";

const pluginConfig = {
  name: "addowner",
  alias: ["addowner"],
  category: "owner",
  description: "Tambah user sebagai owner bot",
  usage: ".addowner @user",
  example: ".addowner @628xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, db }) {
  try {
    const target =
      m.mentionedJid?.[0] ||
      m.quoted?.sender ||
      (m.text ? m.text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

    if (!target || target === "@s.whatsapp.net") {
      return m.reply("❌ Tag atau reply user yang ingin dijadikan owner!\nUsage: .addowner @user");
    }

    const cleanNum = target.replace(/[^0-9]/g, "");
    const res = addOwner(cleanNum, m.pushName || "Owner");

    if (db && typeof db.setUser === "function") {
      db.setUser(cleanNum, { role: "owner" });
    }

    if (res.success) {
      await m.reply(`✅ Berhasil menambahkan @${cleanNum} sebagai owner bot!`);
    } else {
      await m.reply(`ℹ️ @${cleanNum}: ${res.message}`);
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
