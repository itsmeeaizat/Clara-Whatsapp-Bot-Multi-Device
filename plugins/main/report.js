// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "report",
  alias: ["report", "laporkan", "lapor", "reportuser"],
  category: "group",
  description: "Laporkan masalah ke owner/admin bot",
  usage: ".report <pesan>",
  example: ".report Ada spam di grup",
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
    const raw = m.text?.trim() || "";
    const message = raw.replace(/^\.report\s+/i, "").trim();

    if (!message) {
      const text =
        alyaHeader("Cara Pakai", "📣") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}report <pesan>*`,
          `◦ Contoh: *${prefix}report Ada spam di grup*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const reportData = {
      from: m.sender,
      chat: m.chat,
      message,
      createdAt: Date.now(),
    };
    db.push("reports", reportData);

    const text =
      alyaHeader("Report", "📣") +
      "\n\n" +
      bracketBox("📣", "ʟᴀᴘᴏʀᴀɴ", [
        `◦ Pesan: *${message.slice(0, 1500)}${message.length > 1500 ? "..." : ""}*`,
        "◦ Status: *Tersimpan*",
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
