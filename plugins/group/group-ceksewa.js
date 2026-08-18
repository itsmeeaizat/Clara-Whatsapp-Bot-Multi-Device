import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";
import { humanDuration } from "../../src/lib/clara-group-util.js";

const pluginConfig = {
  name: "ceksewa",
  alias: ["ceksewa", "sewagroup", "ceksesi", "sewacheck"],
  category: "group",
  description: "Check group rental status",
  usage: ".ceksewa",
  example: ".ceksewa",
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

    let statusStr = "Tidak Disewa / Default";
    let expireStr = "-";
    let durationStr = "-";

    if (groupSewa) {
      if (groupSewa.permanent || groupSewa.isPermanent) {
        statusStr = "Aktif (Permanen)";
        expireStr = "Tidak Ada Kedaluwarsa";
        durationStr = "Selamanya";
      } else if (groupSewa.expired || groupSewa.expireTime) {
        const expTime = groupSewa.expired || groupSewa.expireTime;
        const now = Date.now();
        if (expTime > now) {
          statusStr = "Aktif";
          expireStr = new Date(expTime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
          durationStr = humanDuration(expTime - now);
        } else {
          statusStr = "Kedaluwarsa";
          expireStr = new Date(expTime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
          durationStr = "Sudah Habis";
        }
      }
    }

    const text =
      alyaHeader("Status Sewa Grup", "📋") +
      "\n\n" +
      bracketBox("📋", "ɪɴꜰᴏ ꜱᴇᴡᴀ", [
        `◦ Group ID: *${m.chat}*`,
        `◦ Status Sewa: *${statusStr}*`,
        `◦ Kedaluwarsa: *${expireStr}*`,
        `◦ Sisa Waktu: *${durationStr}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}sewa untuk perpanjang atau sewa bot`);

    await m.reply(text);
  } catch (err) {
    await m.reply(`❌ Gagal mengecek status sewa: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
