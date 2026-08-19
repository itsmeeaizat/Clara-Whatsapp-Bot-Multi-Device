// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "wikipedia",
  alias: ["wikipedia", "wiki", "wikipediaid"],
  category: "search",
  description: "Cari artikel Wikipedia Indonesia",
  usage: ".wikipedia <query>",
  example: ".wikipedia Indonesia",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();
    if (!query) {
      const text = alyaHeader("Cara Pakai", "📚") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}wikipedia <query>*`,
        `◦ Contoh: *${prefix}wikipedia Indonesia*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    // Search for the page title first
    const searchRes = await axios.get("https://id.wikipedia.org/w/api.php", {
      params: { format: "json", action: "query", list: "search", srsearch: query, srlimit: 1 },
      timeout: 10000,
    });

    const searchResults = searchRes.data?.query?.search;
    if (!searchResults?.length) throw new Error("Tidak ditemukan di Wikipedia");

    const title = searchResults[0].title;

    // Get the extract
    const extractRes = await axios.get("https://id.wikipedia.org/w/api.php", {
      params: { format: "json", action: "query", prop: "extracts", exintro: 1, explaintext: 1, titles: title },
      timeout: 10000,
    });

    const pages = extractRes.data?.query?.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId]?.extract;

    if (!extract) throw new Error("Konten tidak ditemukan");

    const maxLen = 1200;
    const truncated = extract.length > maxLen ? extract.substring(0, maxLen) + "..." : extract;

    const text = alyaHeader("Wikipedia", "📚") + "\n\n" +
      bracketBox("📚", "ᴡɪᴋɪᴘᴇᴅɪᴀ", [
        `◦ Judul: *${title}*`,
      ]) + "\n\n" + truncated + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}wikipedia <query> untuk cari lagi`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text = alyaHeader("Gagal", "❌") + "\n\n" + bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`, `◦ Alasan: *${error.message}*`,
    ]) + "\n\n" + separator() + "\n" + tipText(`Coba lagi nanti`);
    await m.reply(text);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
