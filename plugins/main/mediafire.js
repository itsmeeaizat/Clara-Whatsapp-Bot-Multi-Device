/**
 * Downloader — MediaFire
 * Download file dari MediaFire.
 * Usage: .mediafire <url>
 */

const pluginConfig = {
  name: "mediafire",
  alias: ["mediafire", "mediafiredl"],
  category: "downloader",
  description: "Download file dari MediaFire",
  usage: ".mediafire <url>",
  example: ".mediafire https://www.mediafire.com/file/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = m.args?.[0];
  if (!url) return m.reply(`URL-nya mana?\nContoh: ${m.prefix || "."}mediafire https://www.mediafire.com/file/xxx`);
  if (!/mediafire\.com/i.test(url)) return m.reply("URL MediaFire tidak valid!");

  try {
    await m.reply("⏳ Scraping MediaFire...");

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Extract download link
    const dlMatch = html.match(/href="(https:\/\/download\d*\.mediafire\.com\/[^"]+)"/);
    if (!dlMatch) throw new Error("Link download tidak ditemukan");

    // Extract filename
    const nameMatch = html.match(/<div class="filename">([^<]+)<\/div>/);
    const filename = nameMatch ? nameMatch[1].trim() : "mediafire_file";

    await m.reply(`📥 Download: ${filename}\nLink: ${dlMatch[1]}\n\n⚠️ Link di atas bisa di-buka langsung di browser.`);

    // Try to download the file
    const dlRes = await fetch(dlMatch[1], {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(60000),
    });
    if (!dlRes.ok) throw new Error("Gagal download file");

    const buf = Buffer.from(await dlRes.arrayBuffer());
    const contentType = dlRes.headers.get("content-type") || "application/octet-stream";

    await sock.sendMessage(m.chat, {
      document: buf,
      mimetype: contentType,
      fileName: filename,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
