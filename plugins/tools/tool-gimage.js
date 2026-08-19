// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Google Image Search
 * Cari gambar dari Google Images via Bing.
 * Usage: .gimage <query>
 */

const pluginConfig = {
  name: "gimage",
  alias: ["googleimage", "image"],
  category: "tools",
  description: "Cari gambar dari Google/Bing Images",
  usage: ".gimage <query>",
  example: ".gimage kucing lucu",
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
    return m.reply(`Mau cari gambar apa?\nContoh: ${m.prefix || "."}gimage kucing lucu`);
  }

  try {
    // Scraping Bing Image Search
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();

    // Extract image URLs dari Bing results
    // Bing menyimpan URL gambar di atribut m="{...}" dalam tag <a>
    const imgMatches = [...html.matchAll(/murl&quot;:&quot;([^&]+)&quot;/g)];
    const imageUrls = imgMatches
      .map(m => m[1].replace(/\\u0026/g, "&"))
      .filter(u => /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i.test(u) || /^https?:\/\/.+/.test(u))
      .slice(0, 5);

    if (imageUrls.length === 0) {
      return m.reply("❌ Tidak ada gambar ditemukan untuk pencarian itu.");
    }

    // Kirim gambar pertama yang berhasil
    let sent = false;
    for (const imgUrl of imageUrls) {
      try {
        const imgRes = await fetch(imgUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!imgRes.ok) continue;
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (!buf || buf.length < 500) continue;

        await sock.sendMessage(m.chat, {
          image: buf,
          caption: `🔍 *Hasil pencarian:* ${query}\n🔗 ${imgUrl.slice(0, 80)}`,
        }, { quoted: m });
        sent = true;
        break;
      } catch {
        continue;
      }
    }

    if (!sent) {
      await m.reply("❌ Semua gambar gagal diunduh. Coba kata kunci lain.");
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
