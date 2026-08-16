import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, ensurePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "profile",
  alias: ["prof", "akun", "data", "karakter", "me"],
  category: "game",
  description: "Lihat profil RPG kamu",
  usage: ".profile",
  example: ".profile",
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
      alyaHeader("Profile", "👤") +
      "\n\n" +
      bracketBox("👤", "ᴘʀᴏꜰɪʟ", [
        `◦ Nama: *${player.name}*`,
        `◦ Level: *${player.level || 1}*`,
        `◦ Rank: *${player.rank || "E"}*`,
        `◦ Job: *${player.job || "Pemburu"}*`,
        `◦ HP: *${player.hp || 100}/${player.maxHp || 100}*`,
        `◦ ATK: *${player.atk || 10}*`,
        `◦ DEF: *${player.def || 5}*`,
        `◦ Exp: *${player.exp || 0}/${player.maxExp || 100}*`,
        `◦ Gold: *${player.gold || 0}*`,
        `◦ W/L: *${player.wins || 0}/${player.losses || 0}*`,
        `◦ Pet: *${player.pet || "Tidak ada"}*`,
        `◦ Partner: *${player.partner || "Tidak ada"}*`,
      ]) +
      "\n\n" +
      separator() +
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
