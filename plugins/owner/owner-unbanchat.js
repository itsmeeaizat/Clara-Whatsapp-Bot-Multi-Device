const pluginConfig = {
  name: "unbanchat",
  alias: ["unbanchat"],
  category: "owner",
  description: "Unban grup/chat",
  usage: ".unbanchat",
  example: ".unbanchat",
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
        db.setGroupSetting(targetChat, "isBanned", false);
      } else if (typeof db.setGroup === "function") {
        db.setGroup(targetChat, { isBanned: false });
      }
      if (typeof db.save === "function") await db.save();
    }

    await m.reply(`✅ Chat/Grup ${targetChat} berhasil di-unban! Bot kembali merespon perintah di chat ini.`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
