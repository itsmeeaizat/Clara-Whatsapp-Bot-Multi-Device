/**
 * Character Info Plugin
 * Cari informasi karakter anime menggunakan Jikan API v4.
 * Usage: .charainfo <name>
 */

const pluginConfig = {
  name: "charainfo",
  alias: ["character", "charainfo"],
  category: "anime",
  description: "Cari informasi karakter anime",
  usage: ".charainfo <name>",
  example: ".charainfo Naruto Uzumaki",
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
    return m.reply(`Nama karakter mana?\nContoh: ${m.prefix || "."}charainfo Naruto Uzumaki`);
  }

  try {
    const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Clara-MD" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      return m.reply("❌ Karakter tidak ditemukan.");
    }

    const char = data.data[0];
    const name = char.name || "N/A";
    const kanji = char.name_kanji ? ` (${char.name_kanji})` : "";
    const rawAbout = char.about || "Tidak ada deskripsi.";
    const about = rawAbout.length > 500 ? rawAbout.slice(0, 500) + "..." : rawAbout;
    const imageUrl = char.images?.jpg?.image_url;

    let txt = `👤 *CHARACTER INFO*\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `📌 *Nama:* ${name}${kanji}\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `📝 *Deskripsi:*\n${about}`;

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
