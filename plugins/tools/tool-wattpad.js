// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Wattpad Search
 * Cari cerita di Wattpad.
 * Usage: .wattpad <query>
 */

const pluginConfig = {
  name: "wattpad",
  alias: ["wattsearch", "wattpadsearch"],
  category: "tools",
  description: "Cari cerita di Wattpad",
  usage: ".wattpad <query>",
  example: ".wattpad cinta remaja",
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
  if (!query) return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}wattpad cinta remaja`);

  try {
    const url = `https://www.wattpad.com/v4/search?query=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const stories = data.stories || data.results || [];

    if (stories.length === 0) {
      // Fallback: scrape search page
      const searchUrl = `https://www.wattpad.com/search/${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(10000),
      });
      const html = await searchRes.text();

      const titleMatches = [...html.matchAll(/<a[^>]*href="\/story\/[^"]+"[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</g)];
      if (titleMatches.length === 0) throw new Error("Tidak ada cerita ditemukan");

      let txt = `📖 *Wattpad Search*\nQuery: ${query}\n━━━━━━━━━━━━━━━━━`;
      for (let i = 0; i < Math.min(5, titleMatches.length); i++) {
        const title = titleMatches[i][1].trim();
        txt += `\n\n${i + 1}. ${title}`;
      }
      await m.reply(txt);
      return { handled: true };
    }

    let txt = `📖 *Wattpad Search*\nQuery: ${query}\n━━━━━━━━━━━━━━━━━`;
    for (const story of stories) {
      txt += `\n\n📚 *${story.title}*\n`;
      txt += `✍️ ${story.user?.name || "N/A"}\n`;
      txt += `👁️ ${story.readCount?.toLocaleString() || "N/A"} reads\n`;
      txt += `🔗 https://www.wattpad.com/story/${story.id || story.group?.id || ""}`;
    }

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
