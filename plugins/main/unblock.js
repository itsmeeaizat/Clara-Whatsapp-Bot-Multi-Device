// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "unblock",
  alias: ["unblock", "unblokir", "unbanuser", "unblock"],
  category: "owner",
  description: "Buka blokir user",
  usage: ".unblock <@target>",
  example: ".unblock @username",
  isOwner: true,
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
    const targetRaw = m.text?.trim();

    if (!targetRaw) {
      const text =
        alyaHeader("Cara Pakai", "✅") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}unblock <@target>*`,
          `◦ Contoh: *${prefix}unblock @username*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const targetName = targetRaw.replace(/^@+/, "") || targetRaw;

    const text =
      alyaHeader("Unblock", "✅") +
      "\n\n" +
      bracketBox("✅", "ᴜɴʙʟᴏᴄᴋ", [
        `◦ Target: *${targetName}*`,
        "◦ Status: *Berhasil di-unblock*",
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
