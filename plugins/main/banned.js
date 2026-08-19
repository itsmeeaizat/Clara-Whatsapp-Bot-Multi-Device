// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "banned",
  alias: ["banned", "banlist", "userbanned"],
  category: "group",
  description: "Lihat daftar user yang dibanned",
  usage: ".banned",
  example: ".banned",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const text =
      alyaHeader("Banned", "🚫") +
      "\n\n" +
      bracketBox("🚫", "ʙᴀɴ ʟɪꜱᴛ", [
        "◦ Belum ada data banned.",
        "◦ Daftar akan ditampilkan setelah ada user banned.",
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
