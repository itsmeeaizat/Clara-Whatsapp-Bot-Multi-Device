import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "mentransfer",
  alias: ["transfer", "tf"],
  category: "rpg",
  description: "Mentransfer sejumlah uang ke pengguna lain",
  usage: ".transfer @user <jumlah>",
  example: ".transfer @628123456789 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, args }) {
  try {
    if (!db.data) db.data = {};
    if (!db.data.users) db.data.users = {};
    if (!db.data.users[m.sender]) {
      db.data.users[m.sender] = {
        money: 0,
        exp: 0,
        level: 1,
        health: 100,
        hunger: 50,
        stamina: 100,
      };
      await db.write();
    }

    const sender = db.data.users[m.sender];

    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    let countStr = args[1];

    if (!target && args[0] && args[0].includes("@")) {
      const cleanJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      target = cleanJid;
    } else if (!target) {
      return await m.reply("❌ Tag/sebutkan pengguna yang ingin ditransfer! Format: .transfer @user <jumlah>");
    }

    if (target === m.sender) {
      return await m.reply("❌ Kamu tidak bisa mentransfer uang ke dirimu sendiri!");
    }

    let amount = parseInt(countStr || args[0]);
    if (isNaN(amount) || amount < 100) {
      return await m.reply("❌ Jumlah transfer tidak valid! Minimal transfer adalah Rp 100.");
    }

    if ((sender.money || 0) < amount) {
      return await m.reply(`❌ Uangmu tidak mencukupi! Saldo kamu: *Rp ${(sender.money || 0).toLocaleString("id-ID")}*.`);
    }

    if (!db.data.users[target]) {
      db.data.users[target] = {
        money: 0,
        exp: 0,
        level: 1,
        health: 100,
        hunger: 50,
        stamina: 100,
      };
    }

    const recipient = db.data.users[target];

    sender.money = (sender.money || 0) - amount;
    recipient.money = (recipient.money || 0) + amount;

    await db.write();

    await m.reply(
      `💸 *TRANSFER BERHASIL!*

` +
      `Penerima: *@${target.split("@")[0]}*
` +
      `Jumlah: *Rp ${amount.toLocaleString("id-ID")}*
` +
      `💳 Sisa Saldo Kamu: *Rp ${sender.money.toLocaleString("id-ID")}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
