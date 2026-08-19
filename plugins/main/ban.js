// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "ban",
  alias: ["ban", "block", "tendang", "kick"],
  category: "group",
  description: "Ban/kick member dari grup",
  usage: ".ban @member",
  example: ".ban @628xxxx",
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
    const target = m.mentionedJid?.[0];

    if (!target) {
      const text =
        alyaHeader("Cara Pakai", "🔨") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ban @member*`,
          `◦ Contoh: *${prefix}ban @628xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.sendMessage(m.chat, {
      text: `@${target.replace(/@.+$/, "")} telah di-ban dari grup.`,
    });

    const text =
      alyaHeader("Ban", "🔨") +
      "\n\n" +
      bracketBox("🔨", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Target: *${target}*`,
        "◦ Status: *BANNED*",
        `◦ Group: *${m.chat}*`,
      ]) +
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
