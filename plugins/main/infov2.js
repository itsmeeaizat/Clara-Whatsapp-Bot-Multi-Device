// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "infov2",
  alias: ["infov2", "info2", "botinfo", "about"],
  category: "main",
  description: "Tampilkan info bot versi 2",
  usage: ".infov2",
  example: ".infov2",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const db = getDatabase();
    const users = Object.keys(db.users || {}).length;
    const groups = Object.keys(db.groups || {}).length;

    const text =
      alyaHeader("Info V2", "📊") +
      "\n\n" +
      bracketBox("📊", "ʙᴏᴛ ɪɴꜰᴏ", [
        `◦ Bot: *${botConfig.bot?.name || "Clara-AI"}*`,
        `◦ Versi: *${botConfig.bot?.version || "1.0.0"}*`,
        `◦ Mode: *${(botConfig.mode || "public").toUpperCase()}*`,
        `◦ Prefix: *${prefix}*`,
        `◦ Users: *${users}*`,
        `◦ Groups: *${groups}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`) +
      "\n" +
      tipText(`Ketik ${prefix}aihelp untuk tanya AI`) +
      "\n" +
      tipText(`Ketik ${prefix}allmenu untuk all menu`);

    await sock.sendMessage(m.chat, {
      text,
      buttons: [
        {
          type: 1,
          buttonId: `menu_infov2_${Date.now()}`,
          buttonText: { displayText: "📋 Menu" },
          value: "menu",
        },
        {
          type: 1,
          buttonId: `aihelp_infov2_${Date.now()}`,
          buttonText: { displayText: "💡 Tanya AI" },
          value: "aihelp",
        },
        {
          type: 1,
          buttonId: `allmenu_infov2_${Date.now()}`,
          buttonText: { displayText: "📌 All Menu" },
          value: "allmenu",
        },
      ],
      headerType: 1,
    });
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
