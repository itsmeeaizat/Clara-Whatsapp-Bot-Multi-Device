import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, addGold, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "shop",
  alias: ["toko", "market", "beli", "store"],
  category: "economy",
  description: "Beli item di shop RPG",
  usage: ".shop",
  example: ".shop",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const ITEMS = [
  { id: "potion", name: "Potion", price: 50 },
  { id: "sword", name: "Sword", price: 200 },
  { id: "shield", name: "Shield", price: 150 },
  { id: "armor", name: "Armor", price: 300 },
  { id: "ring", name: "Ring", price: 500 },
];

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const player = getPlayer(m);
    const gold = player?.gold || 0;

    const lines = ITEMS.map((item, index) => {
      const num = index + 1;
      return `◦ ${num}. *${item.name}* — ${item.price} Gold`;
    });

    const text =
      alyaHeader("Shop", "🏪") +
      "\n\n" +
      bracketBox("🏪", "ᴅᴀꜰᴛᴀʀ", [
        `◦ Saldo: *${gold} Gold*`,
        ...lines,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}buy <no> untuk membeli`) +
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
