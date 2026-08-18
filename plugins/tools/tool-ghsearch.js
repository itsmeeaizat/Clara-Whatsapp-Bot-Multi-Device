/**
 * GitHub Search
 * Cari repository di GitHub.
 * Usage: .ghsearch <query>
 */

const pluginConfig = {
  name: "ghsearch",
  alias: ["githubsearch", "repo", "reposearch"],
  category: "tools",
  description: "Cari repository GitHub",
  usage: ".ghsearch <query>",
  example: ".ghsearch whatsapp bot",
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
  if (!query) return m.reply(`Query-nya mana?\nContoh: ${m.prefix || "."}ghsearch whatsapp bot`);

  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=5`;
    const res = await fetch(url, {
      headers: { "Accept": "application/vnd.github.v3+json", "User-Agent": "Clara-MD" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return m.reply("Tidak ada repository yang ditemukan.");
    }

    let txt = `🐙 *GitHub Search*\nQuery: ${query}\nTotal: ${data.total_count} repos\n━━━━━━━━━━━━━━━━━`;
    for (const repo of data.items) {
      txt += `\n\n📦 *${repo.full_name}*\n`;
      txt += `📝 ${repo.description || "No description"}\n`;
      txt += `⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | 📝 ${repo.language || "N/A"}\n`;
      txt += `🔗 ${repo.html_url}\n`;
    }

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
