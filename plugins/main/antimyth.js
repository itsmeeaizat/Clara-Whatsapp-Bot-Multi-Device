import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "antimyth",
  alias: ["antim", "mythic", "myth", "antimythic"],
  category: "game",
  description: "Fitur antimyth RPG",
  usage: ".antimyth on/off",
  example: ".antimyth on",
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
    const args = m.text?.trim().toLowerCase();

    if (!["on", "off"].includes(args)) {
      const text =
        alyaHeader("Cara Pakai", "⚡") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}antimyth on/off*`,
          `◦ Contoh: *${prefix}antimyth on*`,
          `◦ Contoh: *${prefix}antimyth off*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    db.setGroup(m.chat, { antimyth: args === "on" });

    const text =
      alyaHeader("Antimyth", "⚡") +
      "\n\n" +
      bracketBox("⚡", "ꜱᴛᴀᴛᴜꜱ", [
        "◦ Status: *Aktif*",
        "◦ Drop Rate: *5%*",
        "◦ Event: *Weekend Mythic*",
        `◦ Group: *${m.chat}*`,
        `◦ Setting: *${args === "on" ? "ON" : "OFF"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}antimyth on/off untuk mengubah`) +
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
