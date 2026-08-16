import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "bcgc",
  alias: ["bcgc", "broadcastgroup", "bcgrup", "kirimsemua"],
  category: "owner",
  description: "Broadcast pesan ke semua grup",
  usage: ".bcgc <pesan>",
  example: ".bcgc Update bot",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = m.text?.trim() || "";
    const message = raw.replace(/^\.bcgc\s+/i, "").trim();

    if (!message) {
      const text =
        alyaHeader("Cara Pakai", "📣") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}bcgc <pesan>*`,
          `◦ Contoh: *${prefix}bcgc Update bot*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Broadcast GC", "📣") +
      "\n\n" +
      bracketBox("📣", "ʙʀᴏᴀᴅᴄᴀꜱᴛ", [
        `◦ Pesan: *${message.slice(0, 1500)}${message.length > 1500 ? "..." : ""}*`,
        "◦ Target: *Semua grup*",
        "◦ Status: *Terkirim*",
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
