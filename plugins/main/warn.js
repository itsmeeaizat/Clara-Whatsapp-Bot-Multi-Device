// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "warn",
  alias: ["warn", "peringatan", "warning", "w"],
  category: "group",
  description: "Beri peringatan ke member",
  usage: ".warn @member <alasan>",
  example: ".warn @628xxxx Spam",
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
    const prefix = botConfig.command?.prefix || ".";
    const target = m.mentionedJid?.[0];
    const reason = m.text?.trim().split(/\s+/).slice(1).join(" ") || "Tidak ada alasan";

    if (!target) {
      const text =
        alyaHeader("Cara Pakai", "⚠️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}warn @member <alasan>*`,
          `◦ Contoh: *${prefix}warn @628xxxx Spam*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const cleanTarget = target.replace(/@.+$/, "");
    const user = db.getUser(cleanTarget) || {};
    const warnings = user.warnings || [];
    const currentCount = warnings.length + 1;

    warnings.push({
      reason,
      time: new Date().toISOString(),
      group: m.chat,
    });

    db.setUser(cleanTarget, { warnings });

    await sock.sendMessage(m.chat, {
      text: `@${cleanTarget} mendapat peringatan #${currentCount}\nAlasan: ${reason}`,
    });

    const text =
      alyaHeader("Warn", "⚠️") +
      "\n\n" +
      bracketBox("⚠️", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Target: *${target}*`,
        `◦ Alasan: *${reason}*`,
        `◦ Warn Count: *${currentCount}/3*`,
        "◦ Status: *WARNED*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
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
