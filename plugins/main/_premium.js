// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "premium",
  alias: ["premium", "prem"],
  category: "main",
  description: "Manage premium users (add/del)",
  usage: ".premium add/del @user",
  example: ".premium add @user",
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
    const args = m.args || (m.text ? m.text.trim().split(/\s+/) : []);
    const action = (args[0] || "").toLowerCase();

    if (!["add", "del", "delete", "remove", "list"].includes(action)) {
      return m.reply(`Usage: ${pluginConfig.usage}\nContoh: ${pluginConfig.example}`);
    }

    if (!db.data.users) db.data.users = {};

    if (action === "list") {
      const premUsers = Object.entries(db.data.users)
        .filter(([_, u]) => u.premium)
        .map(([jid]) => `@${jid.split("@")[0]}`);
      if (premUsers.length === 0) {
        return m.reply("Belum ada user premium.");
      }
      return m.reply(`👑 *Daftar User Premium:*\n\n- ${premUsers.join("\n- ")}`, null, {
        mentions: Object.keys(db.data.users).filter((j) => db.data.users[j].premium),
      });
    }

    const targetJid =
      m.mentionedJid?.[0] ||
      (args[1] ? args[1].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

    if (!targetJid || !targetJid.includes("@s.whatsapp.net")) {
      return m.reply(`Usage: ${pluginConfig.usage}\nMohon tag user atau sertakan nomor telepon!`);
    }

    if (!db.data.users[targetJid]) {
      db.data.users[targetJid] = {};
    }

    if (action === "add") {
      db.data.users[targetJid].premium = true;
      db.data.users[targetJid].premiumTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await db.write();
      await m.reply(`✅ Berhasil menambahkan @${targetJid.split("@")[0]} ke daftar premium!`, null, {
        mentions: [targetJid],
      });
    } else if (["del", "delete", "remove"].includes(action)) {
      db.data.users[targetJid].premium = false;
      db.data.users[targetJid].premiumTime = 0;
      await db.write();
      await m.reply(`✅ Berhasil menghapus @${targetJid.split("@")[0]} dari daftar premium!`, null, {
        mentions: [targetJid],
      });
    }
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
