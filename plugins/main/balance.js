// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "balance",
  alias: ["bal", "gold", "dompet", "uang", "balance"],
  category: "economy",
  description: "Cek saldo gold kamu",
  usage: ".balance",
  example: ".balance",
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
    const player = getPlayer(m) || {};

    const balance = player.gold || 0;
    const bank = 0;

    const text =
      alyaHeader("Balance", "💰") +
      "\n\n" +
      bracketBox("💰", "ꜱᴀʟᴅᴏ", [
        `◦ Dompet: *${balance} Gold*`,
        `◦ Bank: *${bank} Gold*`,
        `◦ Total: *${balance + bank} Gold*`,
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
