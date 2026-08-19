// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Sad Cat Meme — popcat.xyz
 * Usage: .sadcat text
 */

import { popcatImage } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "sadcat",
  alias: ["sadcatmeme", "kucingkesepian"],
  category: "fun",
  description: "Buat meme sad cat dengan teks",
  usage: ".sadcat text",
  example: ".sadcat aku kesepian",
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
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}sadcat aku kesepian`);
  }

  try {
    const buf = await popcatImage("sadcat", { text });
    await sock.sendMessage(m.chat, { image: buf, caption: " Sad Cat 😿" }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
