import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "give",
  alias: ["give", "hadiahi", "present", "kirim"],
  category: "economy",
  description: "Berikan gold/item ke player lain",
  usage: ".give @member <jumlah>",
  example: ".give @628xxxx 1000",
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
    const args = m.text?.trim().split(/\s+/);
    const amount = parseInt(args?.[1] || "0", 10);

    if (!target || !amount || amount <= 0) {
      const text =
        alyaHeader("Cara Pakai", "🎁") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}give @member <jumlah>*`,
          `◦ Contoh: *${prefix}give @628xxxx 1000*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Give", "🎁") +
      "\n\n" +
      bracketBox("🎁", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Dari: *${m.pushName || "Player"}*`,
        `◦ Kepada: *${target}*`,
        `◦ Jumlah: *${amount} Gold*`,
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
