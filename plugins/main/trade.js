// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "trade",
  alias: ["tukar", "exchange", "trade", "market"],
  category: "economy",
  description: "Tukar item dengan player lain",
  usage: ".trade @member <item> <jumlah>",
  example: ".trade @628xxxx Potion 2",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const target = m.mentionedJid?.[0];

    if (!target) {
      const text =
        alyaHeader("Cara Pakai", "🤝") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}trade @member <item> <jumlah>*`,
          `◦ Contoh: *${prefix}trade @628xxxx Potion 2*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const item = m.text?.trim().split(/\s+/).slice(2).join(" ") || "Unknown";

    const text =
      alyaHeader("Trade", "🤝") +
      "\n\n" +
      bracketBox("🤝", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Dari: *${m.pushName || "Player"}*`,
        `◦ Kepada: *${target}*`,
        `◦ Item: *${item}*`,
        "◦ Status: *Menunggu konfirmasi*",
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
