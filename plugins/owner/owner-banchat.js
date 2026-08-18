const pluginConfig = {
  name: "banchat",
  alias: ["banchat"],
  category: "owner",
  description: "Ban grup/chat dari penggunaan bot",
  usage: ".banchat",
  example: ".banchat",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { db }) {
  try {
    const targetChat = (m.text || "").trim() || m.chat;

    if (db) {
      if (typeof db.setGroupSetting === "function") {
        db.setGroupSetting(targetChat, "isBanned", true);
      } else if (typeof db.setGroup === "function") {
        db.setGroup(targetChat, { isBanned: true });
      }
      if (typeof db.save === "function") await db.save();
    }

    await m.reply(`⛔ Chat/Grup ${targetChat} berhasil di-ban! Bot tidak akan merespon perintah di chat ini.`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
