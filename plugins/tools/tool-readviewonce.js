/**
 * Tool Read View Once Messages
 * Usage: .readviewonce (reply to view once message)
 */

const pluginConfig = {
  name: "readviewonce",
  alias: ["rvo", "viewonce"],
  category: "tools",
  description: "Read view-once messages",
  usage: ".readviewonce (reply pesan view once)",
  example: ".readviewonce",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!m.quoted) {
      return m.reply("Reply pesan View Once yang ingin dibuka!");
    }

    const q = m.quoted;
    const msg = q.message || q;

    // Detect viewonce structure
    const voMsg =
      msg?.viewOnceMessage ||
      msg?.viewOnceMessageV2 ||
      msg?.viewOnceMessageV2Extension ||
      (q.isViewOnce ? msg : null);

    const targetMsg = voMsg?.message || msg;

    const isImage = targetMsg?.imageMessage || /image/.test(q.mimetype || "");
    const isVideo = targetMsg?.videoMessage || /video/.test(q.mimetype || "");
    const isAudio = targetMsg?.audioMessage || /audio/.test(q.mimetype || "");

    const buffer = await q.download?.().catch(() => null);

    if (!buffer) {
      return m.reply("❌ Gagal mengunduh atau membaca pesan View Once.");
    }

    const caption = targetMsg?.imageMessage?.caption || targetMsg?.videoMessage?.caption || "🔓 *View Once Message*";

    if (isImage) {
      await sock.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });
    } else if (isVideo) {
      await sock.sendMessage(m.chat, { video: buffer, caption }, { quoted: m });
    } else if (isAudio) {
      await sock.sendMessage(m.chat, { audio: buffer, mimetype: "audio/mp4", ptt: true }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, { text: `🔓 *View Once Text:* ${q.text || "Tidak ada teks"}` }, { quoted: m });
    }
  } catch (err) {
    await m.reply(`❌ Gagal membuka view once: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
