// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Play Store Search
 * Cari aplikasi di Google Play Store.
 * Usage: .playstore <query>
 */

const pluginConfig = {
  name: "playstore",
  alias: ["playstoresearch", "apk", "pssearch"],
  category: "tools",
  description: "Cari aplikasi di Play Store",
  usage: ".playstore <nama app>",
  example: ".playstore whatsapp",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const query = m.args?.join(" ");
  if (!query) return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}playstore whatsapp`);

  try {
    const url = `https://seravin-api.blogspot.com/api/playstore.php?q=${encodeURIComponent(query)}`;
    let res = await fetch(url, { signal: AbortSignal.timeout(10000) });

    // Fallback: scrape Play Store directly
    if (!res.ok) {
      const psUrl = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&hl=id&gl=ID`;
      const psRes = await fetch(psUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(10000),
      });
      if (!psRes.ok) throw new Error(`HTTP ${psRes.status}`);

      const html = await psRes.text();
      const apps = [];

      // Extract app links and names
      const appMatches = [...html.matchAll(/\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)[^>]*>([^<]*)</g)];
      for (const match of appMatches.slice(0, 5)) {
        const pkg = match[1];
        const name = match[2].trim();
        if (name) {
          apps.push({
            name,
            id: pkg,
            url: `https://play.google.com/store/apps/details?id=${pkg}`,
          });
        }
      }

      if (apps.length === 0) throw new Error("Tidak ada hasil");

      let txt = `📱 *Play Store Search*\nQuery: ${query}\n━━━━━━━━━━━━━━━━━`;
      for (const app of apps) {
        txt += `\n\n📦 *${app.name}*\n🔗 ${app.url}`;
      }
      await m.reply(txt);
      return { handled: true };
    }

    const data = await res.json();
    if (!data.result || data.result.length === 0) throw new Error("Tidak ada hasil");

    let txt = `📱 *Play Store Search*\nQuery: ${query}\n━━━━━━━━━━━━━━━━━`;
    for (const app of data.result.slice(0, 5)) {
      txt += `\n\n📦 *${app.title || app.name}*\n`;
      txt += `👨‍💻 ${app.developer || app.dev || "N/A"}\n`;
      txt += `⭐ ${app.rating || "N/A"}\n`;
      txt += `🔗 ${app.url || app.link}`;
    }

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
