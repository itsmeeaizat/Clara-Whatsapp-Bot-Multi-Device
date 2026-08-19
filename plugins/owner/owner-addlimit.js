// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const pluginConfig = {
  name: "addlimit",
  alias: ["addlimit"],
  category: "owner",
  description: "Tambah limit/energi user",
  usage: ".addlimit @user <amount>",
  example: ".addlimit @628xxx 100",
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
    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    const textArgs = (m.text || "").trim().split(/\s+/);
    const amountStr = textArgs.find((arg) => !isNaN(arg) && Number(arg) > 0);
    const amount = amountStr ? parseInt(amountStr, 10) : 10;

    if (!target) {
      return m.reply("❌ Tag atau reply user yang ingin ditambah limitnya!\nUsage: .addlimit @user <amount>");
    }

    const cleanJid = target.replace(/[^0-9]/g, "");
    if (db) {
      if (typeof db.updateEnergi === "function") {
        db.updateEnergi(cleanJid, amount);
      } else if (typeof db.getUser === "function" && typeof db.setUser === "function") {
        const u = db.getUser(cleanJid) || {};
        const curr = u.energi ?? u.limit ?? 0;
        db.setUser(cleanJid, { energi: curr + amount, limit: curr + amount });
      }
    }

    await m.reply(`✅ Berhasil menambahkan ${amount} limit/energi ke @${cleanJid}.`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
