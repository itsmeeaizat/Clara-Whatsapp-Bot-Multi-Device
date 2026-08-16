import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "withdraw",
  alias: ["withdraw", "tarik", "ambil", "wd"],
  category: "economy",
  description: "Tarik gold dari bank ke dompet",
  usage: ".withdraw <jumlah>",
  example: ".withdraw 1000",
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
    const amount = parseInt(m.text?.trim() || "0", 10);

    if (!amount || amount <= 0) {
      const text =
        alyaHeader("Cara Pakai", "🏦") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}withdraw <jumlah>*`,
          `◦ Contoh: *${prefix}withdraw 1000*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Withdraw", "🏦") +
      "\n\n" +
      bracketBox("🏦", "ʜᴀꜱɪʟ", [
        `◦ Jumlah: *${amount} Gold*`,
        "◦ Dari: *Bank*",
        "◦ Ke: *Dompet*",
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
