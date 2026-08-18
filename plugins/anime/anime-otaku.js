/**
 * Otaku Search Plugin
 * Cari top 5 hasil anime dari Jikan API v4.
 * Usage: .otakusearch <title>
 */

const pluginConfig = {
  name: "otakusearch",
  alias: ["otaku", "otakusearch"],
  category: "anime",
  description: "Cari anime (top 5 hasil)",
  usage: ".otakusearch <title>",
  example: ".otakusearch Attack on Titan",
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
    return m.reply(`Judul anime-nya mana?\nContoh: ${m.prefix || "."}otakusearch Attack on Titan`);
  }

  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Clara-MD" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      return m.reply("❌ Tidak ada hasil anime yang ditemukan.");
    }

    let txt = `🔍 *OTAKU SEARCH*\nQuery: *${query}*\n━━━━━━━━━━━━━━━━━`;
    data.data.slice(0, 5).forEach((anime, idx) => {
      const title = anime.title || anime.title_japanese || "N/A";
      const type = anime.type || "N/A";
      const episodes = anime.episodes ?? "N/A";
      const score = anime.score ?? "N/A";
      const link = anime.url || "N/A";

      txt += `\n\n*${idx + 1}. ${title}*`;
      txt += `\n📺 *Type:* ${type}`;
      txt += `\n🎞️ *Episodes:* ${episodes}`;
      txt += `\n⭐ *Score:* ${score}`;
      txt += `\n🔗 *URL:* ${link}`;
    });

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
