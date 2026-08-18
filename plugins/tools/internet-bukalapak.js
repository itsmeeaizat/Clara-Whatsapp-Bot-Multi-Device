/**
 * Bukalapak Product Search
 * Cari produk di Bukalapak.
 * Usage: .bukalapak <nama barang>
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
  formatNumber,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "bukalapak",
  alias: ["blsearch", "bukalapaksearch", "bl"],
  category: "tools",
  description: "Cari produk di Bukalapak",
  usage: ".bukalapak <nama barang>",
  example: ".bukalapak laptop gaming",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const query = m.args?.join(" ");
  if (!query) {
    return m.reply(
      alyaHeader("Bukalapak Search", "🛍️") +
        "\n\n" +
        bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
          `◦ Ketik: *${m.prefix || "."}bukalapak <nama barang>*`,
          `◦ Contoh: *${m.prefix || "."}bukalapak laptop gaming*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Cari barang impianmu dengan harga terbaik!"),
    );
  }

  try {
    const searchUrl = `https://api.bukalapak.com/v2/products.json?q=${encodeURIComponent(query)}&limit=10`;
    let items = [];

    try {
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.products?.length) {
          items = json.products.slice(0, 5).map((p) => ({
            name: p.name || "Produk Bukalapak",
            price: p.price ? `Rp ${formatNumber(p.price)}` : "Hubungi Penjual",
            seller: p.store?.name || p.seller_name || "Bukalapak Seller",
            location: p.store?.city || p.seller_city || "Indonesia",
            rating: p.rating?.average_rate || "N/A",
            link: p.url || `https://www.bukalapak.com/p/${p.id}`,
          }));
        }
      }
    } catch {
      // Fallback API if primary Bukalapak endpoint fails
    }

    if (items.length === 0) {
      // Web scraping fallback
      const scrapeUrl = `https://www.bukalapak.com/products?search%5Bkeywords%5D=${encodeURIComponent(query)}`;
      const resScrape = await fetch(scrapeUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (resScrape.ok) {
        const html = await resScrape.text();
        const matches = [
          ...html.matchAll(/class="bl-link"[^>]*title="([^"]+)"[^>]*href="([^"]+)"/g),
        ];

        for (const match of matches.slice(0, 5)) {
          const name = match[1]?.trim();
          let link = match[2]?.trim();
          if (name && link) {
            if (!link.startsWith("http")) link = `https://www.bukalapak.com${link}`;
            items.push({
              name,
              price: "Cek di situs",
              seller: "Bukalapak",
              location: "Indonesia",
              rating: "N/A",
              link,
            });
          }
        }
      }
    }

    if (items.length === 0) {
      throw new Error(`Produk "${query}" tidak ditemukan di Bukalapak.`);
    }

    let txt = alyaHeader("Bukalapak Search", "🛍️") + `\n\n🔎 *Query:* _${query}_\n\n`;
    items.forEach((item, i) => {
      txt += bracketBox(`📦 #${i + 1}`, item.name, [
        `◦ Harga: *${item.price}*`,
        `◦ Toko: *${item.seller}* (${item.location})`,
        `◦ Rating: *${item.rating}*`,
        `◦ Link: ${item.link}`,
      ]) + "\n\n";
    });
    txt += separator() + "\n" + tipText("Klik link untuk melihat detail & beli!");

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 150)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
