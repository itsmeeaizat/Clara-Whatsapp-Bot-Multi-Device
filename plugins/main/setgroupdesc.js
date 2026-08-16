import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "setgroupdesc",
  alias: ["setgroupdesc", "gantidesc", "gcdesc", "setgdesc"],
  category: "group",
  description: "Ganti deskripsi grup",
  usage: ".setgroupdesc <deskripsi>",
  example: ".setgroupdesc Grup RPG Clara Official",
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
    const desc = m.text?.trim();

    if (!desc) {
      const text =
        alyaHeader("Cara Pakai", "📝") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}setgroupdesc <deskripsi>*`,
          `◦ Contoh: *${prefix}setgroupdesc Grup RPG Clara*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.groupMetadataUpdate(m.chat, { description: desc });

    const text =
      alyaHeader("Set Group Desc", "📝") +
      "\n\n" +
      bracketBox("📝", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Deskripsi Baru: *${desc}*`,
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
