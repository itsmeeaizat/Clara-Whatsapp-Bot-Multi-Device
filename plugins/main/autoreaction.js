// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "autoreaction",
  alias: ["autoreact", "reaction", "autoemoji", "react"],
  category: "group",
  description: "Auto reaction pesan di grup",
  usage: ".autoreaction on/off",
  example: ".autoreaction on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = m.text?.trim().toLowerCase();

    if (!["on", "off"].includes(args)) {
      const text =
        alyaHeader("Autoreaction", "❤️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}autoreaction on/off*`,
          `◦ Contoh: *${prefix}autoreaction on*`,
          `◦ Contoh: *${prefix}autoreaction off*`,
          `◦ Emoji: ${EMOJIS.join(" ")}`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    db.setGroup(m.chat, { autoreaction: args === "on" });

    const text =
      alyaHeader("Autoreaction", "❤️") +
      "\n\n" +
      bracketBox("❤️", "ꜱᴛᴀᴛᴜꜱ", [
        "◦ Fitur: *Auto Reaction*",
        `◦ Status: *${args === "on" ? "ON" : "OFF"}*`,
        `◦ Group: *${m.chat}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}autoreaction on/off untuk mengubah`) +
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
