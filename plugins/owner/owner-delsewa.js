// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const pluginConfig = {
  name: "delsewa",
  alias: ["delsewa"],
  category: "owner",
  description: "Hapus sewa grup",
  usage: ".delsewa <groupid>",
  example: ".delsewa 120363xxx@g.us",
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
    const groupId = (m.text || "").trim() || (m.isGroup ? m.chat : null);

    if (!groupId) {
      return m.reply("❌ Masukkan ID grup atau gunakan command di dalam grup!\nUsage: .delsewa <groupid>");
    }

    const sewaObj = db?.db?.data?.sewa || db?.sewa;
    if (!sewaObj || !sewaObj.groups || !sewaObj.groups[groupId]) {
      return m.reply(`ℹ️ Grup ${groupId} tidak ada dalam daftar sewa.`);
    }

    delete sewaObj.groups[groupId];

    if (db && typeof db.markDirty === "function") db.markDirty("sewa");
    if (db && typeof db.save === "function") await db.save();

    await m.reply(`✅ Berhasil menghapus sewa untuk grup ${groupId}.`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
