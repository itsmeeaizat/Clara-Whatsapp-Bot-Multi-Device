import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { addGold, getPlayer, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "gacha",
  alias: ["gacha", "pull", "summon", "gachapon"],
  category: "game",
  description: "Tarik gacha untuk dapat item langka",
  usage: ".gacha",
  example: ".gacha",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3600,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const pool = [
      { name: "Common Sword", rarity: "Common", chance: 60 },
      { name: "Silver Shield", rarity: "Rare", chance: 30 },
      { name: "Dragon Blade", rarity: "Epic", chance: 9 },
      { name: "Crown of God", rarity: "Legendary", chance: 1 },
    ];

    const roll = Math.random() * 100;
    let cumulative = 0;
    let item = pool[0];
    for (const p of pool) {
      cumulative += p.chance;
      if (roll <= cumulative) {
        item = p;
        break;
      }
    }

    const player = getPlayer(m);
    const inventory = player?.inventory || {};
    const currentCount = inventory[item.name] || 0;

    savePlayer(m, {
      inventory: {
        ...inventory,
        [item.name]: currentCount + 1,
      },
    });

    const text =
      alyaHeader("Gacha", "🎉") +
      "\n\n" +
      bracketBox("🎉", "ʜᴀꜱɪʟ", [
        `◦ Item: *${item.name}*`,
        `◦ Rarity: *${item.rarity}*`,
        `◦ Chance: *${item.chance}%*`,
        `◦ Jumlah: *${currentCount + 1}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}gacha untuk coba lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
