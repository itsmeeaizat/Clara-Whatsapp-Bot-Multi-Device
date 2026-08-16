import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "berita",
  alias: ["berita", "news", "info", "headline"],
  category: "info",
  description: "Cari berita terbaru",
  usage: ".berita <query>",
  example: ".berita teknologi",
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
        alyaHeader("Cara Pakai", "📰") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}berita <query>*`,
          `◦ Contoh: *${prefix}berita teknologi*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const apiUrl = `https://api.zeks.xyz/api/news?q=${encodeURIComponent(query)}`;
    let news = [];

    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.status && Array.isArray(json.result)) {
        news = json.result.map((item) => ({
          title: item.title || "Tanpa judul",
          link: item.link || item.url || "-",
        }));
      }
    } catch {
      news = [];
    }

    if (!news.length) {
      const text =
        alyaHeader("Berita", "📰") +
        "\n\n" +
        bracketBox("📰", "ʜᴀꜱɪʟ", [
          `◦ Query: *${query}*`,
          "◦ Status: *Tidak ada berita ditemukan*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}berita <query> untuk cari berita lain`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    const items = news.slice(0, 8).map((n, i) => `${i + 1}. ${n.title}\n   ${n.link}`);

    const text =
      alyaHeader("Berita", "📰") +
      "\n\n" +
      bracketBox("📰", "ʜᴇᴀᴅʟɪɴᴇ", items) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}berita <query> untuk cari berita lain`) +
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
