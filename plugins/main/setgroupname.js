// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "setgroupname",
  alias: ["setgroupname", "gantinama", "gcnama", "setgname"],
  category: "group",
  description: "Ganti nama grup",
  usage: ".setgroupname <nama baru>",
  example: ".setgroupname Grup RPG Clara",
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
    const name = m.text?.trim();

    if (!name) {
      const text =
        alyaHeader("Cara Pakai", "🏷️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}setgroupname <nama>*`,
          `◦ Contoh: *${prefix}setgroupname Grup RPG Clara*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.groupMetadataUpdate(m.chat, { subject: name });

    const text =
      alyaHeader("Set Group Name", "🏷️") +
      "\n\n" +
      bracketBox("🏷️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Nama Baru: *${name}*`,
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
