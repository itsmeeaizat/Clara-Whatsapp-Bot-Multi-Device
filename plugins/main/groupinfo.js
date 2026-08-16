import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "groupinfo",
  alias: ["groupinfo", "gcinfo", "info", "grupinfo"],
  category: "group",
  description: "Tampilkan informasi grup",
  usage: ".groupinfo",
  example: ".groupinfo",
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
    const chat = m.chat;

    let metadata = {};
    try {
      metadata = await sock.groupMetadata(chat);
    } catch {}

    const db = getDatabase();
    const group = db.getGroup(chat) || {};
    const members = metadata.participants || [];
    const admins = members.filter((p) => p.admin === "admin" || p.admin === "superadmin");
    const settings = [
      `◦ Antilink: *${group.antilink ? "ON" : "OFF"}*`,
      `◦ Antidelete: *${group.antidelete ? "ON" : "OFF"}*`,
      `◦ Antinsfw: *${group.antinsfw ? "ON" : "OFF"}*`,
      `◦ Antiraid: *${group.antiraid ? "ON" : "OFF"}*`,
      `◦ Antivirtual: *${group.antivirtual ? "ON" : "OFF"}*`,
    ].join("\n");

    const text =
      alyaHeader("Group Info", "👥") +
      "\n\n" +
      bracketBox("👥", "ɪɴꜰᴏ", [
        `◦ Nama: *${metadata.subject || m.chatName || "-"}*`,
        `◦ ID: *${chat}*`,
        `◦ Members: *${members.length}*`,
        `◦ Admins: *${admins.length}*`,
        `◦ Mode: *${(botConfig.mode || "public").toUpperCase()}*`,
      ]) +
      "\n\n" +
      bracketBox("🛡️", "ᴘʀᴏᴛᴇᴄᴛɪᴏɴ", settings) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`) +
      "\n" +
      tipText(`Ketik ${prefix}aihelp untuk tanya AI`) +
      "\n" +
      tipText(`Ketik ${prefix}allmenu untuk all menu`);

    await sock.sendMessage(chat, {
      text,
      buttons: [
        {
          type: 1,
          buttonId: `menu_groupinfo_${Date.now()}`,
          buttonText: { displayText: "📋 Menu" },
          value: "menu",
        },
        {
          type: 1,
          buttonId: `aihelp_groupinfo_${Date.now()}`,
          buttonText: { displayText: "💡 Tanya AI" },
          value: "aihelp",
        },
        {
          type: 1,
          buttonId: `allmenu_groupinfo_${Date.now()}`,
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
