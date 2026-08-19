// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "pushkontak",
  alias: ["pushkontak", "pushk", "kontak", "pushcontact"],
  category: "group",
  description: "Push kontak ke grup",
  usage: ".pushkontak <jumlah>",
  example: ".pushkontak 10",
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
    const amount = Math.max(1, Math.min(parseInt(m.text?.trim() || "0", 10) || 0, 50));
    const chat = m.chat;

    if (!amount) {
      const text =
        alyaHeader("Cara Pakai", "👥") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}pushkontak <jumlah>*`,
          `◦ Contoh: *${prefix}pushkontak 10*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const users = Object.keys(db.users || {});
    const target = users.slice(0, amount);

    if (!target.length) {
      const text =
        alyaHeader("Push Kontak", "👥") +
        "\n\n" +
        bracketBox("👥", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Status: *Tidak ada kontak tersimpan*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const lines = target.map((jid, i) => `${i + 1}. ${jid}`);
    const body =
      `👥 *PUSH KONTAK*\n` +
      `┃ ◦ Jumlah: *${target.length}*\n\n` +
      lines.join("\n");

    await sock.sendMessage(chat, { text: body });

    const text =
      alyaHeader("Push Kontak", "👥") +
      "\n\n" +
      bracketBox("👥", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Jumlah: *${target.length} kontak*`,
        `◦ Group: *${chat}*`,
        "◦ Status: *TERKIRIM*",
      ]) +
      "\n\n" +
      separator() +
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
