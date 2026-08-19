// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "bank",
  alias: ["tabungan", "save", "withdraw", "deposit", "bank"],
  category: "economy",
  description: "Kelola tabungan RPG kamu",
  usage: ".bank <deposit/withdraw/balance> <jumlah>",
  example: ".bank deposit 1000",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = m.text?.trim().split(/\s+/);
    const action = args?.[0]?.toLowerCase();
    const amount = parseInt(args?.[1] || "0", 10);

    if (!["deposit", "withdraw", "balance"].includes(action) || !amount) {
      const text =
        alyaHeader("Cara Pakai", "🏦") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}bank <deposit/withdraw/balance> <jumlah>*`,
          `◦ Contoh: *${prefix}bank deposit 1000*`,
          `◦ Contoh: *${prefix}bank withdraw 500*`,
          `◦ Contoh: *${prefix}bank balance*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const balance = 5000;
    const savings = 2000;

    const text =
      alyaHeader("Bank", "🏦") +
      "\n\n" +
      bracketBox("🏦", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Aksi: *${action}*`,
        `◦ Jumlah: *${amount} Gold*`,
        `◦ Tabungan: *${savings} Gold*`,
        `◦ Dompet: *${balance} Gold*`,
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
