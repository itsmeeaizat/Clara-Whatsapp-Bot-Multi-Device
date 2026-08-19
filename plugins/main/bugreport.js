// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "bugreport",
  alias: ["bugreport", "bug", "reportbug", "laporbug"],
  category: "info",
  description: "Laporkan bug ke owner/admin bot",
  usage: ".bugreport <pesan>",
  example: ".bugreport Fitur .play error",
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
    const message = raw.replace(/^\.bugreport\s+/i, "").trim();

    if (!message) {
      const text =
        alyaHeader("Cara Pakai", "🐞") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}bugreport <pesan>*`,
          `◦ Contoh: *${prefix}bugreport Fitur .play error*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    db.push("bugReports", {
      from: m.sender,
      chat: m.chat,
      message,
      createdAt: Date.now(),
    });

    const text =
      alyaHeader("Bug Report", "🐞") +
      "\n\n" +
      bracketBox("🐞", "ʀᴇᴘᴏʀᴛ", [
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
