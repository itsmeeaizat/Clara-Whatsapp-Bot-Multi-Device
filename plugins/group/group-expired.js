import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";
import { humanDuration } from "../../src/lib/clara-group-util.js";

const pluginConfig = {
  name: "expired",
  alias: ["expired", "cekexpired", "exp", "sewaexpired"],
  category: "group",
  description: "Check when rental expires",
  usage: ".expired",
  example: ".expired",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    if (!m.isGroup) return m.reply("Command ini hanya untuk grup!");

    const database = db || getDatabase();
    const prefix = botConfig?.command?.prefix || ".";

    const sewaData = database.sewa || database.data?.sewa || {};
    const groupSewa = sewaData.groups?.[m.chat] || database.getGroup?.(m.chat)?.sewa;

    let expireDate = "Tidak Terdaftar";
    let remainingTime = "N/A";
    let isExpired = false;

    if (!groupSewa) {
      remainingTime = "Grup tidak dalam masa sewa aktif.";
    } else if (groupSewa.permanent || groupSewa.isPermanent) {
      expireDate = "Permanen";
      remainingTime = "Masa sewa tidak terbatas.";
    } else {
      const expTime = groupSewa.expired || groupSewa.expireTime || 0;
      const now = Date.now();
      expireDate = new Date(expTime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

      if (expTime <= now) {
        isExpired = true;
        remainingTime = "Masa sewa telah habis!";
      } else {
        remainingTime = humanDuration(expTime - now);
      }
    }

    const text =
      alyaHeader("Cek Expired Grup", "⏳") +
      "\n\n" +
      bracketBox(isExpired ? "⚠️" : "⏳", "Mᴀsᴀ Sᴇᴡᴀ", [
        `◦ Group: *${m.chat}*`,
        `◦ Tanggal Expired: *${expireDate}*`,
        `◦ Sisa Durasi: *${remainingTime}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}owner untuk perpanjang sewa`);

    await m.reply(text);
  } catch (err) {
    await m.reply(`❌ Gagal mengecek expired: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
