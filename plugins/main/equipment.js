import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "equipment",
  alias: ["equip", "gear", "peralatan", "equipment"],
  category: "game",
  description: "Lihat dan pasang equipment RPG",
  usage: ".equipment",
  example: ".equipment",
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

    // Placeholder: ganti dengan data equipment RPG kamu
    const equipped = [
      { slot: "Weapon", name: "Iron Sword", atk: 15 },
      { slot: "Armor", name: "Leather Armor", def: 10 },
      { slot: "Accessory", name: "Ring of Power", bonus: "+5% EXP" },
    ];

    const inventory = [
      "Potion x3",
      "Sword x1",
      "Shield x1",
    ];

    const text =
      alyaHeader("Equipment", "🛡️") +
      "\n\n" +
      bracketBox("🛡️", "ᴇǫᴜɪᴘᴘᴇᴅ", equipped.map((e) => `◦ ${e.slot}: *${e.name}* (ATK:${e.atk ?? 0} DEF:${e.def ?? 0} ${e.bonus ?? ""})`.trim())) +
      "\n\n" +
      bracketBox("🎒", "ɪɴᴠᴇɴᴛᴏʀʏ", inventory.map((item) => `◦ ${item}`)) +
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
