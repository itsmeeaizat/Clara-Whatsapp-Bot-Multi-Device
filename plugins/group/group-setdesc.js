// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "setdesc",
  alias: ["setdesc", "setdescription", "gantidesc", "setgdesc"],
  category: "group",
  description: "Set group description (admin only)",
  usage: ".setdesc <deskripsi>",
  example: ".setdesc Selamat datang di grup kami!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    if (!m.isGroup) return m.reply("Command ini hanya untuk grup!");
    if (!m.isAdmin && !m.isOwner) return m.reply("Command ini hanya untuk admin grup!");

    const prefix = botConfig?.command?.prefix || ".";
    const newDesc = m.text?.trim();

    if (!newDesc) {
      const text =
        alyaHeader("Set Deskripsi Grup", "📝") +
        "\n\n" +
        bracketBox("📋", "ᴘᴇɴɢɢᴜɴᴀᴀɴ", [
          `◦ Format: *${prefix}setdesc <deskripsi baru>*`,
          `◦ Contoh: *${prefix}setdesc Dilarang spam dan promosi!*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Khusus Admin Grup");

      await m.reply(text);
      return { handled: true };
    }

    if (typeof sock.groupUpdateDescription === "function") {
      await sock.groupUpdateDescription(m.chat, newDesc);
    } else {
      await sock.groupMetadataUpdate(m.chat, { description: newDesc });
    }

    const text =
      alyaHeader("Berhasil Set Deskripsi", "✅") +
      "\n\n" +
      bracketBox("📝", "ᴅᴇsᴋʀɪᴘsɪ Bᴀʀᴜ", [
        `◦ Deskripsi: *${newDesc}*`,
        `◦ Status: *Berhasil Diperbarui*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}intro untuk melihat info grup`);

    await m.reply(text);
  } catch (err) {
    await m.reply(`❌ Gagal mengubah deskripsi grup: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
