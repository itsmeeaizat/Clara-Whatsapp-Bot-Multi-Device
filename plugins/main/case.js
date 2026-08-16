import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "case",
  alias: ["case", "casebot", "kasus", "report"],
  category: "tools",
  description: "Buat case/laporan",
  usage: ".case <deskripsi>",
  example: ".case Bug di fitur RPG",
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
    const desc = m.text?.trim();

    if (!desc) {
      const text =
        alyaHeader("Cara Pakai", "📁") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}case <deskripsi>*`,
          `◦ Contoh: *${prefix}case Bug di fitur RPG*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Case", "📁") +
      "\n\n" +
      bracketBox("📁", "ʟᴀᴘᴏʀᴀɴ", [
        `◦ Deskripsi: *${desc}*`,
        `◦ Pelapor: *${m.pushName || m.sender}*`,
        "◦ Status: *TERKIRIM*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}case <deskripsi> untuk buat laporan lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
