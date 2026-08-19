// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "spam",
  alias: ["spam", "flood", "bomb", "spammer"],
  category: "tools",
  description: "Spam pesan untuk entertainment",
  usage: ".spam <jumlah> <pesan>",
  example: ".spam 5 Halo",
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
    const count = Math.min(parseInt(args?.[0] || "0", 10) || 0, 10);
    const message = args?.slice(1).join(" ") || "Spam!";

    if (!count || count <= 0) {
      const text =
        alyaHeader("Cara Pakai", "⚠️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}spam <jumlah> <pesan>*`,
          `◦ Contoh: *${prefix}spam 5 Halo*`,
          "◦ Maksimal: *10x*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const chat = m.chat;

    for (let i = 0; i < count; i++) {
      await sock.sendMessage(chat, { text: `${message}` });
    }

    const text =
      alyaHeader("Spam", "⚠️") +
      "\n\n" +
      bracketBox("⚠️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Jumlah: *${count}x*`,
        `◦ Pesan: *${message}*`,
        "◦ Status: *SELESAI*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Gunakan dengan bijak, jangan spam di chat orang lain`) +
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
