// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Chord Gitar — Search guitar chords
 * Fetch dari https://api.lolhuman.xyz/api/chord?apikey=demo&query=QUERY
 * atau fallback web scraping dari chordtela.
 * Usage: .chord <judul lagu>
 */

import * as cheerio from "cheerio";

const pluginConfig = {
  name: "chord",
  alias: ["chordgitar", "kord"],
  category: "tools",
  description: "Cari chord / kunci gitar lagu",
  usage: ".chord <judul lagu>",
  example: ".chord akad payung teduh",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function scrapeChordTela(query) {
  const searchUrl = `https://www.chordtela.com/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  let pageUrl = null;
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!pageUrl && href && href.includes(".html") && href.includes("chordtela.com")) {
      pageUrl = href;
    }
  });

  if (!pageUrl) throw new Error("Lagu tidak ditemukan di scraping fallback");

  const pageRes = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);

  const pageHtml = await pageRes.text();
  const $page = cheerio.load(pageHtml);

  const title = $page("h1.entry-title, .post-title").first().text().trim() || query;
  const chordText = $page("pre, .entry-content pre").first().text().trim();

  if (!chordText) throw new Error("Tidak dapat membaca chord dari halaman");

  return { title, chord: chordText };
}

async function handler(m) {
  const query = m.args?.join(" ") || (m.quoted?.text?.trim() || "");
  if (!query) {
    return m.reply(`Masukkan judul lagu!\nContoh: ${m.prefix || "."}chord akad payung teduh`);
  }

  try {
    let result = null;

    // 1. Try lolhuman API
    try {
      const url = `https://api.lolhuman.xyz/api/chord?apikey=demo&query=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 200 && json.result) {
          result = {
            title: json.result.title || query,
            chord: json.result.chord || json.result
          };
        }
      }
    } catch {
      // API down or failed
    }

    // 2. Fallback to scraping if API failed or didn't return chord
    if (!result || !result.chord) {
      try {
        result = await scrapeChordTela(query);
      } catch (scrapeErr) {
        return m.reply(`❌ Chord untuk "*${query}*" tidak ditemukan.\n_Detail: ${scrapeErr.message}_`);
      }
    }

    if (!result || !result.chord) {
      return m.reply(`❌ Chord untuk "*${query}*" tidak ditemukan.`);
    }

    let message = `*🎸 CHORD GITAR*\n`;
    if (result.title) message += `*Judul:* ${result.title}\n\n`;
    message += `\`\`\`\n${result.chord}\n\`\`\``;

    return m.reply(message.trim());
  } catch (err) {
    return m.reply(`❌ Gagal mencari chord: ${String(err.message).slice(0, 100)}`);
  }
}

export default { config: pluginConfig, handler };
