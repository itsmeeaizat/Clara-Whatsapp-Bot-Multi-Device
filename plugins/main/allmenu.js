import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  getSortedCategories,
  getCategories,
  getCommandsByCategory,
  CATEGORY_EMOJIS,
} from "../../src/lib/clara-plugins.js";

const pluginConfig = {
  name: "allmenu",
  alias: ["allmenu", "allcmd", "semuamenu", "fullmenu"],
  category: "main",
  description: "Tampilkan semua command bot",
  usage: ".allmenu",
  example: ".allmenu",
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
    const categories = getSortedCategories(m);

    const userName = m.pushName || "Guest";
    const userId = m.sender || "unknown";

    let text =
      alyaHeader("Semua Menu", "📌") +
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
      const lines = cat.commands.slice(0, 10).map((cmd) => {
        if (typeof cmd === "string") return `◦ .${cmd}`;
        const aliases = cmd.aliases?.length ? ` (${cmd.aliases.slice(0, 3).join(", ")})` : "";
        return `◦ .${cmd.name}${aliases}`;
      });
      text += bracketBox(emoji, catName, lines) + "\n\n";
    }

    text +=
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}help untuk menu bantuan`) +
      "\n" +
      tipText(`Ketik ${prefix}aihelp untuk tanya AI`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await sock.sendMessage(m.chat, {
      text,
      buttons: [
        {
          type: 1,
          buttonId: `menu_allmenu_${Date.now()}`,
          buttonText: { displayText: "📋 Menu" },
          value: "menu"
        },
        {
          type: 1,
          buttonId: `aihelp_allmenu_${Date.now()}`,
          buttonText: { displayText: "💡 Tanya AI" },
          value: "aihelp"
        },
        {
          type: 1,
          buttonId: `help_allmenu_${Date.now()}`,
          buttonText: { displayText: "📌 Help" },
          value: "help"
        },
        {
          type: 1,
          buttonId: `back_${Date.now()}`,
          buttonText: { displayText: "🔙 Kembali" },
          value: "menu"
        },
        {
          type: 1,
          buttonId: `allkategori_${Date.now()}`,
          buttonText: { displayText: "📂 All Kategori" },
          value: "allkategori"
        },
        {
          type: 1,
          buttonId: `donasi_${Date.now()}`,
          buttonText: { displayText: "💝 Donasi" },
          value: "donasi"
        },
        {
          type: 1,
          buttonId: `owner_${Date.now()}`,
          buttonText: { displayText: "👑 Owner" },
          value: "owner"
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

  // Handle All Kategori button - show popup with all categories
  if (m.body && m.body.toLowerCase().includes('allkategori')) {
    const allCategories = getSortedCategories(m);
    let categoryText = '📂 *All Kategori Menu*

';
    for (const cat of allCategories) {
      const emoji = cat.emoji || '📁';
      const cmds = cat.commands.map(cmd => `${prefix}${cmd}`).join(', ');
      categoryText += `${emoji} *${cat.name.toUpperCase()}* (${cat.commands.length} cmd)
${cmds}

`;
    }
    categoryText += `${separator()}
💡 Ketik ${prefix}menucat <kategori> untuk lihat detail`;
    await sock.sendMessage(m.chat, { text: categoryText });
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
