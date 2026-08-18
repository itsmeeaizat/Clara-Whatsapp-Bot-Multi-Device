/**
 * Google Search
 * Search Google dan return top results.
 * Usage: .google <query>
 */

const pluginConfig = {
  name: "google",
  alias: ["gsearch", "googlesearch", "gogel"],
  category: "tools",
  description: "Cari di Google",
  usage: ".google <query>",
  example: ".google cara masak nasi",
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
  if (!query) return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}google cara masak nasi`);

  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id&num=5`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "id,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const results = [];

    // Parse Google search results
    const linkMatches = [...html.matchAll(/<a href="\/url\?q=([^&"]+)"/g)];
    const titleMatches = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)];

    const count = Math.min(5, Math.min(linkMatches.length, titleMatches.length));
    if (count === 0) throw new Error("Tidak ada hasil");

    let txt = `🔍 *Google Search*\nQuery: ${query}\n━━━━━━━━━━━━━━━━━\n`;
    for (let i = 0; i < count; i++) {
      const title = titleMatches[i]?.[1]?.trim() || "No title";
      const link = decodeURIComponent(linkMatches[i]?.[1] || "");
      txt += `\n${i + 1}. *${title}*\n   ${link}\n`;
    }
    txt += `\n━━━━━━━━━━━━━━━━━\nGoogle Search by Clara-MD`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
