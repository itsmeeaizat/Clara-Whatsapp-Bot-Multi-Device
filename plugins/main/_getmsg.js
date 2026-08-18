import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "getmsg",
  alias: ["getmsg", "gmsg", "fetchmsg"],
  category: "main",
  description: "Get stored message berdasarkan key",
  usage: ".getmsg <key>",
  example: ".getmsg info",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const key = (m.args?.[0] || m.text || "").trim();
    if (!key) {
      if (!db.data.msgs || Object.keys(db.data.msgs).length === 0) {
        return m.reply(`Usage: ${pluginConfig.usage}\nBelum ada pesan tersimpan di db.`);
      }
      const list = Object.keys(db.data.msgs).join("\n- ");
      return m.reply(`Usage: ${pluginConfig.usage}\nDaftar key pesan tersimpan:\n- ${list}`);
    }

    if (!db.data.msgs || !db.data.msgs[key]) {
      return m.reply(`❌ Pesan dengan key *${key}* tidak ditemukan!`);
    }

    const msgData = db.data.msgs[key];
    if (typeof msgData === "string") {
      await m.reply(msgData);
    } else if (msgData && typeof msgData === "object") {
      if (msgData.text) {
        await m.reply(msgData.text);
      } else {
        await sock.sendMessage(m.chat, msgData, { quoted: m });
      }
    }
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
