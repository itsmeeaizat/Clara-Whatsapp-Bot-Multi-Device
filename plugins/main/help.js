// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  getSortedCategories,
} from "../../src/lib/clara-plugins.js";

const pluginConfig = {
  name: "help",
  alias: ["help", "bantuan", "menu", "cmd"],
  category: "main",
  description: "Tampilkan menu bantuan",
  usage: ".help",
  example: ".help",
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
    const categories = getSortedCategories(m);

    const userName = m.pushName || "Guest";
    const userId = m.sender || "unknown";

    let text =
      alyaHeader("Menu Bantuan", "📋") +
      "\n\n" +
      bracketBox("👤", "ᴘʀᴏꜰɪʟ", [
        `◦ Nama: *${userName}*`,
        `◦ ID: *${userId}*`,
        `◦ Role: *${m.isOwner ? "Owner" : "User"}*`,
      ]) +
      "\n\n";

    for (const cat of categories) {
      const emoji = cat.emoji || "📁";
      const catName = cat.name.toUpperCase();
      const lines = cat.commands.slice(0, 8).map((cmd) => {
        if (typeof cmd === "string") return `◦ .${cmd}`;
        const aliases = cmd.aliases?.length ? ` (${cmd.aliases.slice(0, 3).join(", ")})` : "";
        return `◦ .${cmd.name}${aliases}`;
      });
      text += bracketBox(emoji, catName, lines) + "\n\n";
    }

    text +=
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}allmenu untuk semua command`) +
      "\n" +
      tipText(`Ketik ${prefix}aihelp untuk tanya AI`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await sock.sendMessage(m.chat, {
      text,
      buttons: [
        {
          type: 1,
          buttonId: `menu_help_${Date.now()}`,
          buttonText: { displayText: "📋 Menu" },
          value: "menu"
        },
        {
          type: 1,
          buttonId: `aihelp_help_${Date.now()}`,
          buttonText: { displayText: "💡 Tanya AI" },
          value: "aihelp"
        },
        {
          type: 1,
          buttonId: `allmenu_help_${Date.now()}`,
          buttonText: { displayText: "📌 Semua Menu" },
          value: "allmenu"
        }
      ],
      headerType: 1
    });
  } catch (error) {
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        "◦ Status: *Error*",
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
