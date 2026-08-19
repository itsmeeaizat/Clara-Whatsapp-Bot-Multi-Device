// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Manga Info Plugin
 * Cari informasi detail tentang manga menggunakan Jikan API v4.
 * Usage: .mangainfo <title>
 */

const pluginConfig = {
  name: "mangainfo",
  alias: ["manga", "mangainfo"],
  category: "anime",
  description: "Cari informasi detail tentang manga",
  usage: ".mangainfo <title>",
  example: ".mangainfo One Piece",
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
    return m.reply(`Judul manga mana?\nContoh: ${m.prefix || "."}mangainfo One Piece`);
  }

  try {
    const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Aizat" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      return m.reply("❌ Manga tidak ditemukan.");
    }

    const manga = data.data[0];
    const title = manga.title || manga.title_japanese || "N/A";
    const rawSynopsis = manga.synopsis || "Tidak ada sinopsis.";
    const synopsis = rawSynopsis.length > 500 ? rawSynopsis.slice(0, 500) + "..." : rawSynopsis;
    const score = manga.score ?? "N/A";
    const chapters = manga.chapters ?? "N/A";
    const genres = manga.genres?.map((g) => g.name).join(", ") || "N/A";
    const status = manga.status || "N/A";
    const imageUrl = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url;

    let txt = `📖 *MANGA INFO*\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `📌 *Judul:* ${title}\n`;
    txt += `⭐ *Score:* ${score}\n`;
    txt += `📚 *Chapters:* ${chapters}\n`;
    txt += `🏷️ *Genre:* ${genres}\n`;
    txt += `📡 *Status:* ${status}\n`;
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
