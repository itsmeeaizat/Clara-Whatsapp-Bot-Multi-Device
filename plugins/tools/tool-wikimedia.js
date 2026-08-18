/**
 * Wikimedia Commons Image Search
 * Search images from Wikimedia Commons.
 * Usage: .wikimedia <query>
 */

const pluginConfig = {
  name: "wikimedia",
  alias: ["wikiimg", "wikiimage", "commons"],
  category: "tools",
  description: "Cari gambar di Wikimedia Commons",
  usage: ".wikimedia <query>",
  example: ".wikimedia kucing",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = m.args?.join(" ");
  if (!query) return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}wikimedia kucing`);

  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json&gsrlimit=3`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return m.reply("Tidak ada gambar ditemukan.");

    const items = Object.values(pages).filter(p => p.imageinfo?.[0]?.url);

    for (const item of items.slice(0, 3)) {
      const imgUrl = item.imageinfo[0].url;
      const title = item.title.replace(/^File:/, "");

      try {
        const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(15000) });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          await sock.sendMessage(m.chat, {
            image: buf,
            caption: `📷 ${title}\n\nSource: Wikimedia Commons`,
          }, { quoted: m });
        }
      } catch {}
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
