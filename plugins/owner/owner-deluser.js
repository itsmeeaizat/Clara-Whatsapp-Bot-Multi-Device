const pluginConfig = {
  name: "deluser",
  alias: ["deluser"],
  category: "owner",
  description: "Hapus user dari database",
  usage: ".deluser @user",
  example: ".deluser @628xxx",
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
    const target =
      m.mentionedJid?.[0] ||
      m.quoted?.sender ||
      (m.text ? m.text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

    if (!target || target === "@s.whatsapp.net") {
      return m.reply("❌ Tag atau reply user yang ingin dihapus dari DB!\nUsage: .deluser @user");
    }

    const cleanNum = target.replace(/[^0-9]/g, "");

    if (db) {
      if (typeof db.deleteUser === "function") {
        db.deleteUser(cleanNum);
      } else if (db.db?.data?.users?.[cleanNum]) {
        delete db.db.data.users[cleanNum];
      }
      if (typeof db.save === "function") await db.save();
    }

    await m.reply(`🗑️ Berhasil menghapus user @${cleanNum} dari database.`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
