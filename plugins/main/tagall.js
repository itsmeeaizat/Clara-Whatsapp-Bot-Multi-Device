// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tagall",
  alias: ["tagall", "tag", "mentionall", "all"],
  category: "group",
  description: "Tag semua member grup",
  usage: ".tagall <pesan>",
  example: ".tagall Halo guys!",
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
    const message = m.text?.trim();

    if (!message) {
      const text =
        alyaHeader("Cara Pakai", "👥") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}tagall <pesan>*`,
          `◦ Contoh: *${prefix}tagall Halo guys!*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    let metadata = {};
    try {
      metadata = await sock.groupMetadata(m.chat);
    } catch {}

    const participants = metadata.participants || [];
    const mentions = participants.map((p) => p.id);

    const body =
      `👥 *TAG ALL*\n` +
      `┃ ◦ Pesan: *${message}*\n` +
      `┃ ◦ Members: *${participants.length}*\n\n` +
      `${mentions.map((id) => `@${id.replace(/@.+$/, "")}`).join(" ")}`;

    await sock.sendMessage(m.chat, { text: body, mentions });

    const text =
      alyaHeader("Tag All", "👥") +
      "\n\n" +
      bracketBox("👥", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Pesan: *${message}*`,
        `◦ Target: *${participants.length} Member*`,
        "◦ Status: *TERKIRIM*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}tagall <pesan> untuk tag lagi`) +
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
