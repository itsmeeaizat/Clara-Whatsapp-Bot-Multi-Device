/**
 * Info — Total Fitur
 * Hitung total command/fitur yang tersedia di bot.
 * Usage: .totalfitur
 */

import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const pluginConfig = {
  name: "totalfitur",
  alias: ["totalfitur", "totalcommand", "fiturcount"],
  category: "info",
  description: "Hitung total command/fitur bot",
  usage: ".totalfitur",
  example: ".totalfitur",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  try {
    const pluginsDir = join(process.cwd(), "plugins");
    const categories = {};
    let total = 0;

    function scanDir(dir, prefix = "") {
      const items = readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = join(dir, item.name);
        if (item.isDirectory()) {
          scanDir(fullPath, item.name);
        } else if (item.name.endsWith(".js")) {
          const cat = prefix || "other";
          if (!categories[cat]) categories[cat] = 0;
          categories[cat]++;
          total++;
        }
      }
    }

    scanDir(pluginsDir);

    let txt = `📋 *Total Fitur Bot*\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
      txt += `• ${cat}: ${count} fitur\n`;
    }
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `Total: *${total} fitur*`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
