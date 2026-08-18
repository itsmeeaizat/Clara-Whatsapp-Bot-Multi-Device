/**
 * Anime Info Plugin
 * Cari informasi detail tentang anime menggunakan Jikan API v4.
 * Usage: .animeinfo <title>
 */

const pluginConfig = {
  name: "animeinfo",
  alias: ["anime", "animeinfo"],
  category: "anime",
  description: "Cari informasi detail tentang anime",
  usage: ".animeinfo <title>",
  example: ".animeinfo Naruto",
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
  if (!query) {
    return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}animeinfo Naruto`);
  }

  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Clara-MD" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      return m.reply("❌ Anime tidak ditemukan.");
    }

    const anime = data.data[0];
    const title = anime.title || anime.title_japanese || "N/A";
    const rawSynopsis = anime.synopsis || "Tidak ada sinopsis.";
    const synopsis = rawSynopsis.length > 500 ? rawSynopsis.slice(0, 500) + "..." : rawSynopsis;
    const score = anime.score ?? "N/A";
    const episodes = anime.episodes ?? "N/A";
    const genres = anime.genres?.map((g) => g.name).join(", ") || "N/A";
    const status = anime.status || "N/A";
    const studio = anime.studios?.map((s) => s.name).join(", ") || "N/A";
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

    let txt = `🎬 *ANIME INFO*\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `📌 *Judul:* ${title}\n`;
    txt += `⭐ *Score:* ${score}\n`;
    txt += `🎞️ *Episodes:* ${episodes}\n`;
    txt += `🏷️ *Genre:* ${genres}\n`;
    txt += `📡 *Status:* ${status}\n`;
    txt += `🏢 *Studio:* ${studio}\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `📝 *Synopsis:*\n${synopsis}`;

    if (imageUrl && sock) {
      try {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          await sock.sendMessage(m.chat, { image: buf, caption: txt }, { quoted: m });
          return { handled: true };
        }
      } catch {
        // Fallback to text if image download fails
      }
    }

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
