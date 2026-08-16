import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "jpm",
  alias: ["jpm", "joinpmm", "joinpm", "pmm"],
  category: "group",
  description: "Join PMM grup",
  usage: ".jpm",
  example: ".jpm",
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
    const chat = m.chat;
    const db = getDatabase();
    const group = db.getGroup(chat) || {};
    const joined = group.jpm || false;

    db.setGroup(chat, { jpm: !joined });

    const text =
      alyaHeader("Join PMM", "👥") +
      "\n\n" +
      bracketBox("👥", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Group: *${chat}*`,
        `◦ Status: *${!joined ? "Joined" : "Left"}*`,
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
