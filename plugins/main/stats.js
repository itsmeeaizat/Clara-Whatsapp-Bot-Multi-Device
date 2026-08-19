// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import os from "os";
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "stats",
  alias: ["stats", "stat", "info", "botinfo", "infobot"],
  category: "info",
  description: "Lihat statistik bot",
  usage: ".stats",
  example: ".stats",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const db = getDatabase();
    const users = db.getAllUsers();
    const allUsers = Array.isArray(users) ? users : Object.values(users || {});
    const groups = allUsers.filter((u) => u?.group === true);

    const userCount = allUsers.length;
    const groupCount = groups.length;
    const botName = botConfig?.bot?.name || "Bot";
    const ownerName = botConfig?.owner?.name || "Owner";
    const uptime = process.uptime ? `${Math.floor(process.uptime())}s` : "-";
    const platform = `${os.type()} / ${os.arch()} / node ${process.version}`;

    const text =
      alyaHeader("Stats", "📊") +
      "\n\n" +
      bracketBox("📊", "ꜱᴛᴀᴛɪꜱᴛɪᴋ", [
        `◦ Nama Bot: *${botName}*`,
        `◦ Owner: *${ownerName}*`,
        `◦ Total User: *${userCount}*`,
        `◦ Total Group: *${groupCount}*`,
        `◦ Uptime: *${uptime}*`,
        `◦ Platform: *${platform}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        `◦ Status: *Gagal*`,
        `◦ Alasan: *${error.message}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
