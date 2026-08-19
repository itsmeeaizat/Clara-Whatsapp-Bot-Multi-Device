// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Fetch URL Content
 * Mengambil isi konten dari URL/API endpoint.
 * Usage: .fetch <url>
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "fetch",
  alias: ["get", "curl", "fetchurl"],
  category: "tools",
  description: "Fetch isi URL / HTTP GET response",
  usage: ".fetch <url>",
  example: ".fetch https://api.github.com/users/octocat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let url = m.args?.[0];
  if (!url) {
    return m.reply(
      alyaHeader("Fetch URL", "🌐") +
        "\n\n" +
        bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
          `◦ Ketik: *${m.prefix || "."}fetch <url>*`,
          `◦ Contoh: *${m.prefix || "."}fetch https://api.github.com/users/octocat*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Mendukung format JSON, Teks, HTML, maupun Media!"),
    );
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });

    const contentType = res.headers.get("content-type") || "";

    if (/json/i.test(contentType)) {
      const json = await res.json();
      const str = JSON.stringify(json, null, 2);
      const output = str.length > 2500 ? str.slice(0, 2500) + "\n... (dipotong)" : str;

      await m.reply(
        alyaHeader("HTTP JSON Response", "📄") +
          `\n\n📌 *Status:* ${res.status} ${res.statusText}\n🌐 *URL:* ${url}\n\n` +
          "```json\n" +
          output +
          "\n```",
      );
    } else if (/image/i.test(contentType)) {
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(
        m.chat,
        { image: buf, caption: `🖼️ *Fetched Image*\nURL: ${url}` },
        { quoted: m },
      );
    } else if (/audio/i.test(contentType)) {
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(
        m.chat,
        { audio: buf, mimetype: contentType },
        { quoted: m },
      );
    } else if (/video/i.test(contentType)) {
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(
        m.chat,
        { video: buf, caption: `🎥 *Fetched Video*\nURL: ${url}` },
        { quoted: m },
      );
    } else {
      const text = await res.text();
      const output = text.length > 2500 ? text.slice(0, 2500) + "\n... (dipotong)" : text;

      await m.reply(
        alyaHeader("HTTP Response Text", "📄") +
          `\n\n📌 *Status:* ${res.status} ${res.statusText}\n🌐 *URL:* ${url}\n🏷️ *Type:* ${contentType}\n\n` +
          "```\n" +
          output +
          "\n```",
      );
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 150)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
