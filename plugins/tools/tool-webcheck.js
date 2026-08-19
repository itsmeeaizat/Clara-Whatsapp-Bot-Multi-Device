// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Web Check — Check website status
 * Report HTTP status, response time, title, server.
 * Usage: .webcheck <url>
 */

const pluginConfig = {
  name: "webcheck",
  alias: ["cekweb", "siteinfo", "webstatus"],
  category: "tools",
  description: "Cek status website (HTTP status, response time, title)",
  usage: ".webcheck <url>",
  example: ".webcheck https://google.com",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const url = m.args?.[0];
  if (!url) {
    return m.reply(`URL-nya mana?\nContoh: ${m.prefix || "."}webcheck https://google.com`);
  }

  let validUrl = url;
  if (!/^https?:\/\//i.test(validUrl)) {
    validUrl = "https://" + validUrl;
  }

  try {
    const start = Date.now();
    const res = await fetch(validUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    const elapsed = Date.now() - start;

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "-";

    let txt = `🌐 *Web Check*\n━━━━━━━━━━━━━━━━━\n`;
    txt += `🔗 *URL:* ${validUrl}\n`;
    txt += `📊 *Status:* ${res.status} ${res.statusText}\n`;
    txt += `⏱️ *Response:* ${elapsed}ms\n`;
    txt += `📝 *Title:* ${title}\n`;
    txt += `🖥️ *Server:* ${res.headers.get("server") || "-"}\n`;
    txt += `📦 *Content-Type:* ${res.headers.get("content-type") || "-"}\n`;
    txt += `📏 *Size:* ${(html.length / 1024).toFixed(1)} KB\n`;

    const status = res.status;
    if (status >= 200 && status < 300) txt += `✅ *Status:* Online & Healthy`;
    else if (status >= 300 && status < 400) txt += `↩️ *Status:* Redirected`;
    else if (status >= 400 && status < 500) txt += `⚠️ *Status:* Client Error`;
    else txt += `❌ *Status:* Server Error`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ Gagal cek web: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
