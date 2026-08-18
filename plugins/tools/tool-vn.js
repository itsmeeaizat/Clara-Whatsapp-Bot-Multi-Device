/**
 * VN — Voice Notes Collection
 * Kirim voice note lucu / react.
 * Usage: .vn <name>
 */

const voiceNotes = {
  ara: "https://raw.githubusercontent.com/WhiskeySockets/Baileys-media/refs/heads/main/ara.mp3",
  bot: "https://raw.githubusercontent.com/WhiskeySockets/Baileys-media/refs/heads/main/bot.mp3",
  dosa: "https://raw.githubusercontent.com/WhiskeySockets/Baileys-media/refs/heads/main/dosa.mp3",
  loveyou: "https://raw.githubusercontent.com/WhiskeySockets/Baileys-media/refs/heads/main/loveyou.mp3",
  salam: "https://raw.githubusercontent.com/WhiskeySockets/Baileys-media/refs/heads/main/salam.mp3",
  yowaimo: "https://raw.githubusercontent.com/WhiskeySockets/Baileys-media/refs/heads/main/yowaimo.mp3",
};

const vnList = Object.keys(voiceNotes).join(", ");

const pluginConfig = {
  name: "vn",
  alias: ["voice", "voicenote"],
  category: "tools",
  description: "Kirim voice note lucu",
  usage: ".vn <name>",
  example: ".vn ara",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const name = m.args?.[0]?.toLowerCase();
  if (!name) {
    return m.reply(`Voice note tersedia:\n${vnList}\n\nContoh: ${m.prefix || "."}vn ara`);
  }

  const url = voiceNotes[name];
  if (!url) {
    return m.reply(`VN "${name}" tidak ditemukan.\nTersedia: ${vnList}`);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    await sock.sendMessage(m.chat, {
      audio: buf,
      mimetype: "audio/mpeg",
      ptt: true,
    }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ Gagal mengirim VN: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
