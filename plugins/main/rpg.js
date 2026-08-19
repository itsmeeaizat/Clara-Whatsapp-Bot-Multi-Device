// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { ensurePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "rpg",
  alias: ["rpgstart", "register", "start", "join"],
  category: "game",
  description: "Mulai petualangan RPG kamu",
  usage: ".rpg",
  example: ".rpg",
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
    const userName = m.pushName || "Player";

    const player = ensurePlayer(m, userName);

    const text =
      alyaHeader("Karakter", "⚔️") +
      "\n\n" +
      bracketBox("⚔️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Nama: *${player.name}*`,
        `◦ Level: *${player.level || 1}*`,
        `◦ HP: *${player.hp || 100}/${player.maxHp || 100}*`,
        `◦ ATK: *${player.atk || 10}*`,
        `◦ DEF: *${player.def || 5}*`,
        `◦ Exp: *${player.exp || 0}/${player.maxExp || 100}*`,
        `◦ Gold: *${player.gold || 0}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}profile untuk melihat profil kamu`) +
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
