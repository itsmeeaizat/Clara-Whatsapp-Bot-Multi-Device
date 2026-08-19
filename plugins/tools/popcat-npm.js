// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * NPM Package Info — popcat.xyz
 * Usage: .npm baileys
 */

import { popcatJSON } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "npm",
  alias: ["npmsearch", "npmpackage"],
  category: "tools",
  description: "Cari info package NPM",
  usage: ".npm <nama package>",
  example: ".npm baileys",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const q = m.args?.join(" ") || "";
  if (!q) {
    return m.reply(`Nama package-nya mana?\nContoh: ${m.prefix || "."}npm baileys`);
  }

  try {
    const d = await popcatJSON("npm", { q });
    if (d.error) return m.reply(`❌ ${d.error}`);

    let txt = `📦 NPM: ${d.name}\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `🏷️ Versi: ${d.version || "-"}\n`;
    txt += `📝 ${d.description || "No description"}\n`;
    txt += `👤 Author: ${d.author || "-"}\n`;
    if (d.author_email) txt += `📧 ${d.author_email}\n`;
    if (d.repository) txt += `🔗 ${d.repository}\n`;
    if (d.last_published) txt += `📅 Published: ${d.last_published}\n`;
    if (d.downloads_this_year) txt += `📊 Downloads: ${d.downloads_this_year}\n`;
    if (d.maintainers) txt += `🔧 Maintainers: ${d.maintainers}\n`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
