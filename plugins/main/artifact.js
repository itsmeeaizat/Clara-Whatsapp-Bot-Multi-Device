import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "artifact",
  alias: ["artifact", "artefak", "relic", "ancient", "itemlangka"],
  category: "game",
  description: "Lihat koleksi artifact langka",
  usage: ".artifact",
  example: ".artifact",
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

    // Placeholder: ganti dengan data artifact RPG kamu
    const owned = [
      { name: "Crown of God", rarity: "Legendary", power: "+50% ATK" },
      { name: "Dragon Blade", rarity: "Epic", power: "+30% ATK" },
    ];

    const locked = [
      { name: "Ring of Eternity", rarity: "Mythic", power: "+100% All Stats" },
    ];

    const text =
      alyaHeader("Artifact", "🏺") +
      "\n\n" +
      bracketBox("🏺", "ᴋᴏʟᴇᴋꜱɪ", [
        `◦ Owned: *${owned.length}*`,
        `◦ Locked: *${locked.length}*`,
      ]) +
      "\n\n" +
      bracketBox("✅", "ᴏᴡɴᴇᴅ", owned.map((a) => `◦ ${a.name} [${a.rarity}] ${a.power}`)) +
      "\n\n" +
      bracketBox("🔒", "ʟᴏᴄᴋᴇᴅ", locked.map((a) => `◦ ${a.name} [${a.rarity}]`)) +
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
