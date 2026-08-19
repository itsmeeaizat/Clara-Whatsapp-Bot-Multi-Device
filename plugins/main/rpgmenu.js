// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "rpgmenu",
  alias: ["rpgmenu", "rmenu", "rpghelp", "gamehelp"],
  category: "game",
  description: "Menu panduan RPG",
  usage: ".rpgmenu",
  example: ".rpgmenu",
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

    const categories = [
      { name: "Profile", commands: ["profile", "rank", "inventory", "equipment"] },
      { name: "Economy", commands: ["balance", "bank", "daily", "shop", "buy", "sell"] },
      { name: "Action", commands: ["hunt", "mine", "adventure", "boss", "battle"] },
      { name: "Social", commands: ["marry", "pet", "guild", "trade", "give"] },
      { name: "Game", commands: ["gacha", "dungeon", "event", "achievement"] },
    ];

    let text = alyaHeader("RPG Menu", "⚔️") + "\n\n";

    for (const cat of categories) {
      const cmds = cat.commands.map((cmd) => `◦ ${prefix}${cmd}`).join("\n");
      text += bracketBox("📂", cat.name.toUpperCase(), [cmds]) + "\n\n";
    }

    text += separator() + "\n";
    text += tipText(`Ketik ${prefix}menu untuk kembali`);

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
