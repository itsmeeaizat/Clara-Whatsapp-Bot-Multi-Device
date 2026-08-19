// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Downloader — Google Drive
 * Download file dari Google Drive share link.
 * Usage: .gdrive <url>
 */

const pluginConfig = {
  name: "gdrive",
  alias: ["gdrive", "googledrive"],
  category: "downloader",
  description: "Download file dari Google Drive",
  usage: ".gdrive <url>",
  example: ".gdrive https://drive.google.com/file/d/XXX/view",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

function extractFileId(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

async function handler(m, { sock }) {
  const url = m.args?.[0];
  if (!url) return m.reply(`URL-nya mana?\nContoh: ${m.prefix || "."}gdrive https://drive.google.com/file/d/XXX/view`);

  const fileId = extractFileId(url);
  if (!fileId) return m.reply("URL Google Drive tidak valid!");

  try {
    await m.reply("⏳ Download dari Google Drive...");

    // Try direct download
    const dlUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const res = await fetch(dlUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());

    if (buf.length < 1000) {
      // Might be a confirmation page
      throw new Error("File terlalu besar atau butuh konfirmasi download");
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentDisp = res.headers.get("content-disposition") || "";
    const filenameMatch = contentDisp.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `gdrive_${fileId}`;

    // Check if it's a file we can send
    if (contentType.includes("image")) {
      await sock.sendMessage(m.chat, { image: buf, caption: `📁 ${filename}` }, { quoted: m });
    } else if (contentType.includes("video")) {
      await sock.sendMessage(m.chat, { video: buf, caption: `📁 ${filename}` }, { quoted: m });
    } else if (contentType.includes("audio")) {
      await sock.sendMessage(m.chat, { audio: buf, mimetype: contentType }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, {
        document: buf,
        mimetype: contentType,
        fileName: filename,
      }, { quoted: m });
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
