// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const pluginConfig = {
  name: "addsewa",
  alias: ["addsewa"],
  category: "owner",
  description: "Tambah sewa grup",
  usage: ".addsewa <groupid> <days>",
  example: ".addsewa 120363xxx@g.us 30",
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
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    let groupId = m.isGroup ? m.chat : null;
    let days = 30;

    if (args[0] && args[0].includes("@g.us")) {
      groupId = args[0];
      if (args[1] && !isNaN(args[1])) days = parseInt(args[1], 10);
    } else if (args[0] && !isNaN(args[0])) {
      days = parseInt(args[0], 10);
    }

    if (!groupId) {
      return m.reply("❌ Masukkan ID grup atau gunakan command di dalam grup!\nUsage: .addsewa <groupid> <days>");
    }

    const sewaObj = db?.db?.data?.sewa || db?.sewa || { enabled: true, groups: {} };
    if (!sewaObj.groups) sewaObj.groups = {};
    sewaObj.enabled = true;

    const expiredMs = Date.now() + days * 24 * 60 * 60 * 1000;
    const expiredIso = new Date(expiredMs).toISOString();

    sewaObj.groups[groupId] = {
      expiredAt: expiredIso,
      addedAt: new Date().toISOString(),
      notified3Days: false,
      notified1Hour: false,
    };

    if (db && typeof db.markDirty === "function") db.markDirty("sewa");
    if (db && typeof db.save === "function") await db.save();

    await m.reply(`✅ Berhasil menambah sewa grup!\n\n◦ Group: ${groupId}\n◦ Durasi: ${days} Hari\n◦ Expired: ${new Date(expiredMs).toLocaleString("id-ID")}`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
