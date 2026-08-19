// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "setgroupicon",
  alias: ["setgroupicon", "gantiicon", "gcicon", "setgicon"],
  category: "group",
  description: "Ganti icon/emoji grup",
  usage: ".setgroupicon <emoji>",
  example: ".setgroupicon 🎮",
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
    const icon = m.text?.trim();

    if (!icon) {
      const text =
        alyaHeader("Cara Pakai", "😀") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}setgroupicon <emoji>*`,
          `◦ Contoh: *${prefix}setgroupicon 🎮*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.groupMetadataUpdate(m.chat, { subject: icon });

    const text =
      alyaHeader("Set Group Icon", "😀") +
      "\n\n" +
      bracketBox("😀", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Icon Baru: *${icon}*`,
        `◦ Group: *${m.chat}*`,
        "◦ Status: *SUCCESS*",
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
