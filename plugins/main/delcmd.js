// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "delcmd",
  alias: ["delcmd", "removecmd", "rmcmd"],
  category: "tools",
  description: "Hapus custom command",
  usage: ".delcmd <nama>",
  example: ".delcmd halo",
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

    if (!name) {
      const text =
        alyaHeader("Custom Command", "⚙️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}delcmd <nama>*`,
          `◦ Contoh: *${prefix}delcmd halo*`,
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

    if (!customCmds[name]) {
      const text =
        alyaHeader("Custom Command", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴇʀʀᴏʀ", [
          `◦ Nama: *${name}*`,
          "◦ Status: *Tidak ditemukan*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}listcmd untuk melihat daftar cmd`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    delete customCmds[name];
    db.setting("customCmds", customCmds);

    const text =
      alyaHeader("Custom Command", "⚙️") +
      "\n\n" +
      bracketBox("⚙️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Aksi: *DEL*`,
        `◦ Nama: *${name}*`,
        "◦ Status: *SUCCESS*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}listcmd untuk melihat sisa cmd`) +
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
