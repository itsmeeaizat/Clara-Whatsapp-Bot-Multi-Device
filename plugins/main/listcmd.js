// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "listcmd",
  alias: ["listcmd", "cmds", "customcmdlist", "listcustom"],
  category: "tools",
  description: "Lihat daftar custom command",
  usage: ".listcmd",
  example: ".listcmd",
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
    const db = getDatabase();
    const customCmds = db.getSettings().customCmds || {};
    const keys = Object.keys(customCmds);

    if (!keys.length) {
      const text =
        alyaHeader("Custom Command", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ʟɪsᴛ", [
          "◦ *Tidak ada custom command*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}addcmd <nama> <balasan> untuk menambah`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const items = keys.map((k) => `◦ ${k}: *${customCmds[k]}*`).join("\n");

    const text =
      alyaHeader("Custom Command", "⚙️") +
      "\n\n" +
      bracketBox("⚙️", "ʟɪsᴛ", [items]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}addcmd <nama> <balasan> untuk menambah`) +
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
