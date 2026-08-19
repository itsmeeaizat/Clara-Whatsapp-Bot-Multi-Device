// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Wikipedia (Indonesian)
 * Search Wikipedia bahasa Indonesia.
 * Usage: .wiki <query>
 */

const pluginConfig = {
  name: "wiki",
  alias: ["wikipedia", "wikipediaid", "wikipedia"],
  category: "tools",
  description: "Cari di Wikipedia bahasa Indonesia",
  usage: ".wiki <query>",
  example: ".wiki Indonesia",
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
  if (!query) return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}wiki Indonesia`);

  try {
    // Search Wikipedia API
    const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    if (!searchRes.ok) throw new Error(`HTTP ${searchRes.status}`);

    const searchData = await searchRes.json();
    if (!searchData.query?.search?.length) {
      return m.reply("Tidak ditemukan di Wikipedia.");
    }

    const page = searchData.query.search[0];
    const title = page.title;

    // Get full page extract
    const extractUrl = `https://id.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro=1&format=json&explaintext=1`;
    const extractRes = await fetch(extractUrl, { signal: AbortSignal.timeout(10000) });
    const extractData = await extractRes.json();
    const pages = extractData.query?.pages || {};
    const pageData = Object.values(pages)[0];
    const extract = pageData?.extract || page.snippet?.replace(/<[^>]+>/g, "") || "No extract";

    let txt = `📚 *Wikipedia*\n━━━━━━━━━━━━━━━━━\n`;
    txt += `📖 *${title}*\n\n`;
    txt += extract.slice(0, 1000);
    if (extract.length > 1000) txt += "...";
    txt += `\n\n🔗 https://id.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
