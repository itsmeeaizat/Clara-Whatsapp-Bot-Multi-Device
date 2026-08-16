import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const RSS_FEEDS = {
  nasional: "https://www.cnnindonesia.com/nasional/rss",
  internasional: "https://www.cnnindonesia.com/internasional/rss",
  ekonomi: "https://www.cnnindonesia.com/ekonomi/rss",
  teknologi: "https://www.cnnindonesia.com/teknologi/rss",
  olahraga: "https://www.cnnindonesia.com/olahraga/rss",
  hiburan: "https://www.cnnindonesia.com/hiburan/rss",
  default: "https://www.cnnindonesia.com/rss",
};

const pluginConfig = {
  name: "berita",
  alias: ["berita", "news", "beritaterkini"],
  category: "info",
  description: "Berita terkini dari CNN Indonesia",
  usage: ".berita <kategori>",
  example: ".berita nasional",
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
    const kategori = m.text?.trim()?.toLowerCase() || "default";
    const rssUrl = RSS_FEEDS[kategori] || RSS_FEEDS.default;

    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await axios.get(apiUrl, { timeout: 15000 });
    const data = res.data;

    if (!data?.items?.length) throw new Error("Gagal mengambil berita");

    const items = data.items.slice(0, 8);
    const newsList = items.map((item, i) =>
      `${i + 1}. *${item.title}*\n   ${item.link}`
    ).join("\n\n");

    const text =
      alyaHeader("Berita", "📰") +
      "\n\n" +
      bracketBox("📰", "ʙᴇʀɪᴛᴀ ᴛᴇʀᴋɪɴɪ", [
        `◦ Kategori: *${kategori}*`,
        `◦ Sumber: *CNN Indonesia*`,
        `◦ Total: *${items.length} berita*`,
      ]) +
      "\n\n" +
      newsList +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}berita <kategori> untuk kategori lain`) +
      "\n" +
      tipText(`Kategori: nasional, internasional, ekonomi, teknologi, olahraga, hiburan`);

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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
