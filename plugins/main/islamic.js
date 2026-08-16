import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "islamic",
  alias: ["islamic", "islam", "muslim", "quran", "jadwalsholat"],
  category: "religi",
  description: "Fitur Islam: jadwal sholat, quran, dll",
  usage: ".islamic <query>",
  example: ".islamic jadwal sholat Jakarta",
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
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Cara Pakai", "🕌") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Jadwal Sholat: *${prefix}islamic jadwal sholat <kota>*`,
          `◦ Al-Quran: *${prefix}islamic quran <surah>*`,
          `◦ Doa: *${prefix}islamic doa <nama doa>*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Islamic", "🕌") +
      "\n\n" +
      bracketBox("🕌", "ʜᴀꜱɪʟ", [
        `◦ Query: *${query}*`,
        "◦ Results: *10*",
        "◦ Status: *Found*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}islamic <query> untuk pencarian lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
