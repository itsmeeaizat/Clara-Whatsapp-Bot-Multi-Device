// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "addcmd",
  alias: ["addcmd", "addcustom", "newcmd"],
  category: "tools",
  description: "Tambah custom command",
  usage: ".addcmd <nama> <balasan>",
  example: ".addcmd halo Halo juga!",
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
    const args = m.text?.trim().split(/\s+/);
    const name = args?.[0];
    const value = args?.slice(1).join(" ");

    if (!name || !value) {
      const text =
        alyaHeader("Custom Command", "⚙️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}addcmd <nama> <balasan>*`,
          `◦ Contoh: *${prefix}addcmd halo Halo juga!*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const customCmds = db.getSettings().customCmds || {};
    customCmds[name] = value;
    db.setting("customCmds", customCmds);

    const text =
      alyaHeader("Custom Command", "⚙️") +
      "\n\n" +
      bracketBox("⚙️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Aksi: *ADD*`,
        `◦ Nama: *${name}*`,
        `◦ Balasan: *${value}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}listcmd untuk melihat semua cmd`) +
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
