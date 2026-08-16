import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "anime",
  alias: ["anime", "ani", "kawaii", "waifu"],
  category: "fun",
  description: "Cari gambar anime",
  usage: ".anime <query>",
  example: ".anime naruto",
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
        alyaHeader("Cara Pakai", "🎌") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}anime <query>*`,
          `◦ Contoh: *${prefix}anime naruto*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const apiUrl = `https://api.zeks.xyz/api/anime?q=${encodeURIComponent(query)}`;
    let images = [];
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.status && Array.isArray(json.result)) {
        images = json.result.map((item) => item.url || item.image).filter(Boolean);
      }
    } catch {}

    if (!images.length) {
      const text =
        alyaHeader("Anime", "🎌") +
        "\n\n" +
        bracketBox("🎌", "ʜᴀꜱɪʟ", [
          `◦ Query: *${query}*`,
          "◦ Status: *Tidak ada hasil ditemukan*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}anime <query> untuk cari lagi`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    const selected = images.slice(0, 10);
    const body =
      `🎌 *ANIME*\n` +
      `┃ ◦ Query: *${query}*\n` +
      `┃ ◦ Total: *${selected.length}*\n\n` +
      selected.map((url, i) => `${i + 1}. ${url}`).join("\n");

    await m.reply(body);

    const text =
      alyaHeader("Anime", "🎌") +
      "\n\n" +
      bracketBox("🎌", "ʜᴀꜱɪʟ", [
        `◦ Query: *${query}*`,
        `◦ Total: *${selected.length}*`,
        "◦ Status: *SUCCESS*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}anime <query> untuk cari lagi`) +
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
