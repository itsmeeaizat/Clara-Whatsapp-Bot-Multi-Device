const pluginConfig = {
  name: "asupan",
  alias: ["asupan", "asupanvideo"],
  category: "asupan",
  description: "Asupan video acak",
  usage: ".asupan",
  example: ".asupan",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

const CATEGORIES = [
  "blackpink",
  "bocil",
  "bts",
  "china",
  "cosplay",
  "exo",
  "geayubi",
  "gensin",
  "hentai",
  "indonesia",
  "jepang",
  "korea",
  "lewd",
  "malaysia",
  "nekopoi",
  "thailand",
  "vietnam",
];

async function handler(m, { sock }) {
  try {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const url = `https://raw.githubusercontent.com/Itsuka07/wa-supan/main/asupan/${category}${Math.floor(Math.random() * 5) + 1}.mp4`;
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sock.sendMessage(m.chat, { video: buf, caption: `📹 Asupan ${category}` }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
