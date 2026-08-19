// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Unforgivable Meme — popcat.xyz
 * Usage: .unforgivable text
 */

import { popcatImage } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "unforgivable",
  alias: ["unforgive"],
  category: "fun",
  description: "Buat meme unforgivable dengan teks",
  usage: ".unforgivable text",
  example: ".unforgivable lupa ngoding",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args?.join(" ") || "";
  if (!text) {
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}unforgivable lupa ngoding`);
  }

  try {
    const buf = await popcatImage("unforgivable", { text });
    await sock.sendMessage(m.chat, { image: buf, caption: " Unforgivable" }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
