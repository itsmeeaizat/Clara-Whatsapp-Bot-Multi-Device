// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "sell",
  alias: ["jual", "sellitem", "sell"],
  category: "economy",
  description: "Jual item untuk dapat gold",
  usage: ".sell <item> <jumlah>",
  example: ".sell Potion 2",
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
    const args = m.text?.trim().split(/\s+/);
    const item = args?.[0];
    const qty = parseInt(args?.[1] || "1", 10);

    if (!item) {
      const text =
        alyaHeader("Cara Pakai", "💰") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}sell <item> <jumlah>*`,
          `◦ Contoh: *${prefix}sell Potion 2*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const price = 25;
    const total = price * qty;

    const text =
      alyaHeader("Sell", "💰") +
      "\n\n" +
      bracketBox("💰", "ʜᴀꜱɪʟ", [
        `◦ Item: *${qty}x ${item}*`,
        `◦ Harga Satuan: *${price} Gold*`,
        `◦ Total: *${total} Gold*`,
        "◦ Status: *Berhasil*",
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
