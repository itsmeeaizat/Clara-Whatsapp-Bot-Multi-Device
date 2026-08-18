/**
 * Style Text — qaz.wtf
 * Konversi teks ke berbagai style unicode.
 * Usage: .styletext <teks>
 */

const pluginConfig = {
  name: "styletext",
  alias: ["style", "fancytext"],
  category: "tools",
  description: "Konversi teks ke berbagai style unicode",
  usage: ".styletext <teks>",
  example: ".styletext hello",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const text = m.args?.join(" ") || (m.quoted?.text?.trim() || "");
  if (!text) {
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}styletext hello`);
  }

  try {
    const res = await fetch(`https://qaz.wtf/u/convert.cgi?text=${encodeURIComponent(text)}`);
    const html = await res.text();

    // Parse dengan regex
    const matches = [...html.matchAll(/class="aname">([^<]+)<\/span><\/td><td>\s*([\s\S]*?)<\/td>/g)];

    if (matches.length === 0) {
      return m.reply("❌ Gagal memparse style text.");
    }

    let result = `*✨ Style Text*\nInput: ${text}\n\n`;
    for (const match of matches.slice(0, 15)) {
      const name = match[1];
      const val = match[2].trim();
      result += `*${name}*\n${val}\n\n`;
    }
    await m.reply(result.trim());
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
