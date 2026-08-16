import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "spamcall",
  alias: ["spamcall", "spamcall", "telepon", "call"],
  category: "tools",
  description: "Spam call/virtual call untuk entertainment",
  usage: ".spamcall <jumlah> <nomor>",
  example: ".spamcall 5 628xxxx",
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
    const args = m.text?.trim().split(/\s+/);
    const count = Math.min(parseInt(args?.[0] || "0", 10) || 0, 5);
    const target = args?.[1] || m.mentionedJid?.[0];

    if (!count || count <= 0 || !target) {
      const text =
        alyaHeader("Cara Pakai", "📞") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}spamcall <jumlah> <nomor>*`,
          `◦ Contoh: *${prefix}spamcall 3 628xxxx*`,
          `◦ Atau: *${prefix}spamcall 3 @member*`,
          "◦ Maksimal: *5x*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const chat = m.chat;
    const mentions = [];
    const targetClean = String(target).replace(/@.+$/, "");

    for (let i = 0; i < count; i++) {
      const body = `📞 *SPAM CALL*\n┃ ◦ Target: *@${targetClean}*\n┃ ◦ Call #${i + 1}/${count}`;
      mentions.push(targetClean);
      await sock.sendMessage(chat, { text: body, mentions });
    }

    const text =
      alyaHeader("Spam Call", "📞") +
      "\n\n" +
      bracketBox("📞", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Target: *@${targetClean}*`,
        `◦ Jumlah: *${count}x*`,
        "◦ Status: *SELESAI*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Gunakan dengan bijak`) +
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
