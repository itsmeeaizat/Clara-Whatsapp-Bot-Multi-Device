import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "broadcast",
  alias: ["bc", "broadcast", "kirimsemua", "announce"],
  category: "owner",
  description: "Broadcast pesan ke semua grup (owner only)",
  usage: ".broadcast <pesan>",
  example: ".broadcast Update bot v2.0",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const message = m.text?.trim();

    if (!message) {
      const text =
        alyaHeader("Cara Pakai", "📢") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}broadcast <pesan>*`,
          `◦ Contoh: *${prefix}broadcast Update bot v2.0*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const groups = db.getAllGroups();
    const groupJids = Object.keys(groups);

    if (!groupJids.length) {
      const text =
        alyaHeader("Broadcast", "📢") +
        "\n\n" +
        bracketBox("⚠️", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Target: *Tidak ada grup terdaftar*",
          "◦ Status: *Dibatalkan*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const success = [];
    const failed = [];

    for (const jid of groupJids) {
      try {
        await sock.sendMessage(jid, {
          text: `📢 *BROADCAST*\n◦ Dari: *${m.pushName || "Owner"}*\n◦ Pesan:\n${message}`,
        });
        success.push(jid);
      } catch {
        failed.push(jid);
      }
    }

    const text =
      alyaHeader("Broadcast", "📢") +
      "\n\n" +
      bracketBox("📢", "ʜᴀꜱɪʟ", [
        `◦ Pesan: *${message.slice(0, 50)}${message.length > 50 ? "..." : ""}*`,
        `◦ Target: *${groupJids.length} Grup*`,
        `◦ Berhasil: *${success.length}*`,
        `◦ Gagal: *${failed.length}*`,
        "◦ Status: *SELESAI*",
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
