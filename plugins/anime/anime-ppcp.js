/**
 * PP Couple Anime Plugin
 * Kirim 2 foto PP Couple Anime (Male & Female).
 * Usage: .ppcp
 */

const pluginConfig = {
  name: "ppcp",
  alias: ["ppcp", "ppcouple"],
  category: "anime",
  description: "Dapatkan foto PP Couple anime (Male & Female)",
  usage: ".ppcp",
  example: ".ppcp",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const couplePairs = [
  {
    male: "https://picsum.photos/id/1025/600/600",
    female: "https://picsum.photos/id/1062/600/600"
  },
  {
    male: "https://picsum.photos/id/1005/600/600",
    female: "https://picsum.photos/id/1027/600/600"
  },
  {
    male: "https://picsum.photos/id/64/600/600",
    female: "https://picsum.photos/id/65/600/600"
  },
  {
    male: "https://picsum.photos/id/1012/600/600",
    female: "https://picsum.photos/id/1013/600/600"
  },
  {
    male: "https://picsum.photos/id/338/600/600",
    female: "https://picsum.photos/id/349/600/600"
  }
];

async function handler(m, { sock }) {
  try {
    let maleUrl = null;
    let femaleUrl = null;

    try {
      const res = await fetch("https://api.jikan.moe/v4/characters?q=anime&limit=2", {
        headers: { "User-Agent": "Clara-MD" },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length >= 2) {
          maleUrl = data.data[0]?.images?.jpg?.image_url;
          femaleUrl = data.data[1]?.images?.jpg?.image_url;
        }
      }
    } catch {
      // Jikan failed or rate-limited, fall back to couple pairs
    }

    if (!maleUrl || !femaleUrl) {
      const randomPair = couplePairs[Math.floor(Math.random() * couplePairs.length)];
      maleUrl = randomPair.male;
      femaleUrl = randomPair.female;
    }

    // Send Male Image
    if (maleUrl && sock) {
      try {
        const maleRes = await fetch(maleUrl, { signal: AbortSignal.timeout(10000) });
        if (maleRes.ok) {
          const maleBuf = Buffer.from(await maleRes.arrayBuffer());
          await sock.sendMessage(m.chat, {
            image: maleBuf,
            caption: "👦 *PP Couple - Male*",
          }, { quoted: m });
        }
      } catch {
        // Ignore single image send error
      }
    }

    // Send Female Image
    if (femaleUrl && sock) {
      try {
        const femaleRes = await fetch(femaleUrl, { signal: AbortSignal.timeout(10000) });
        if (femaleRes.ok) {
          const femaleBuf = Buffer.from(await femaleRes.arrayBuffer());
          await sock.sendMessage(m.chat, {
            image: femaleBuf,
            caption: "👧 *PP Couple - Female*",
          }, { quoted: m });
        }
      } catch {
        // Ignore single image send error
      }
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
