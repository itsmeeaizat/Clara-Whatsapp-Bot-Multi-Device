// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Downloader — Ringtone
 * Search dan download ringtone.
 * Usage: .ringtone <query>
 */

const pluginConfig = {
  name: "ringtone",
  alias: ["ringtone", "ringtonesearch"],
  category: "downloader",
  description: "Cari dan download ringtone",
  usage: ".ringtone <query>",
  example: ".ringtone iphone",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = m.args?.join(" ");
  if (!query) return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}ringtone iphone`);

  try {
    // Search ringtone from melodyloops or similar
    const searchUrl = `https://www.melodyloops.com/search/?q=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Extract audio links
    const audioLinks = [...html.matchAll(/href="(https:\/\/[^"]+\.mp3)"/g)].slice(0, 5);
    if (audioLinks.length === 0) {
      // Try alternative source
      const altRes = await fetch(`https://api.lolhuman.xyz/api/ringtone?apikey=demo&query=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (altRes.ok) {
        const data = await altRes.json();
        if (data.status && data.result) {
          const ringtones = data.result.slice(0, 5);
          let txt = `🔔 *Ringtone Search: ${query}*\n\n`;
          ringtones.forEach((r, i) => {
            txt += `${i + 1}. ${r.title}\n`;
          });
          txt += `\nKetik .ringtonedl <nomor> untuk download`;
          await m.reply(txt);
          return { handled: true };
        }
      }
      return m.reply("Tidak ditemukan ringtone untuk query tersebut.");
    }

    // Download first result
    const dlUrl = audioLinks[0][1];
    const dlRes = await fetch(dlUrl, { signal: AbortSignal.timeout(15000) });
    if (!dlRes.ok) throw new Error("Gagal download ringtone");

    const buf = Buffer.from(await dlRes.arrayBuffer());
    await sock.sendMessage(m.chat, {
      audio: buf,
      mimetype: "audio/mpeg",
      filename: `${query}_ringtone.mp3`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
