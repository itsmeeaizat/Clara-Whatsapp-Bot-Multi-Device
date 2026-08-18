const pluginConfig = {
  name: "cosplay",
  alias: ["cosplay","cosplayvid"],
  category: "asupan",
  description: "Asupan video cosplay",
  usage: ".cosplay",
  example: ".cosplay",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const url = `https://raw.githubusercontent.com/Itsuka07/wa-supan/main/asupan/cosplay${Math.floor(Math.random() * 5) + 1}.mp4`;
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sock.sendMessage(m.chat, { video: buf, caption: "📹 Asupan cosplay" }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
