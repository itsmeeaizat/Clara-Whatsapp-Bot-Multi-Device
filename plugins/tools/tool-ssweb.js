/**
 * Screenshot Web — thum.io
 * Screenshot halaman web.
 * Usage: .ssweb <url>
 */

const pluginConfig = {
  name: "ssweb",
  alias: ["ss", "screenshot"],
  category: "tools",
  description: "Screenshot halaman web",
  usage: ".ssweb <url>",
  example: ".ssweb https://github.com",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = m.args?.[0];
  if (!url) {
    return m.reply(`URL-nya mana?\nContoh: ${m.prefix || "."}ssweb https://github.com`);
  }

  // Validasi URL
  let validUrl = url;
  if (!/^https?:\/\//i.test(validUrl)) {
    validUrl = "https://" + validUrl;
  }

  try {
    const apiUrl = `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(validUrl)}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());

    if (!buf || buf.length < 100) {
      return m.reply("❌ Gagal mengambil screenshot. Coba URL lain.");
    }

    await sock.sendMessage(m.chat, {
      image: buf,
      caption: `📸 Screenshot: ${validUrl}`,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ Gagal screenshot: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
