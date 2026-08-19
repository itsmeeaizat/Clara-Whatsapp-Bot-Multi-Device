// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "inventory",
  alias: ["inv", "tas", "backpack", "items"],
  category: "game",
  description: "Cek inventory RPG kamu",
  usage: ".inventory",
  example: ".inventory",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const items = [
      { name: "Potion", qty: 3 },
      { name: "Sword", qty: 1 },
      { name: "Shield", qty: 1 },
    ];

    const text =
      alyaHeader("Inventory", "🎒") +
      "\n\n" +
      bracketBox("🎒", "ɪꜱɪ ᴛᴀꜱ", items.map((item) => `◦ ${item.name}: *${item.qty} pcs*`)) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
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
