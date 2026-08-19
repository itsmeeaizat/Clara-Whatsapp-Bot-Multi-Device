// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const COMMANDS = [
  { cmd: ".adventure", desc: "Petualangan RPG" },
  { cmd: ".battle", desc: "Battle PvP" },
  { cmd: ".heist", desc: "Heist / rahasia" },
  { cmd: ".crime", desc: "Aktivitas crime" },
  { cmd: ".rob", desc: "Rampok pemain lain" },
  { cmd: ".rpg", desc: "Menu RPG" },
];

const pluginConfig = {
  name: "game",
  alias: ["game", "games", "rpgmenu", "main"],
  category: "main",
  description: "Menu game RPG",
  usage: ".game",
  example: ".game",
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

    const lines = COMMANDS.map(
      (item) => `${item.cmd} — *${item.desc}*`
    );

    const text =
      alyaHeader("Game", "🎮") +
      "\n\n" +
      bracketBox("🎮", "ʀᴘɢ", lines) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}game untuk lihat menu`) +
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
