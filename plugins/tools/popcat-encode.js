// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Encode Text — popcat.xyz
 * Usage: .encode <type> <text>
 * Type: binary (default), base64, hex, morse, atbash, etc.
 */

import { popcatJSON } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "encode",
  alias: ["encodetext", "enc"],
  category: "tools",
  description: "Encode teks ke binary/base64/hex/morse",
  usage: ".encode <type> <text>",
  example: ".encode binary hello",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const args = m.args || [];
  if (args.length < 1) {
    return m.reply(
      `Format salah!\nContoh: ${m.prefix || "."}encode binary hello\nAtau: ${m.prefix || "."}encode hello (default binary)`
    );
  }

  let type = "binary";
  let text = "";
  if (args.length >= 2) {
    type = args[0];
    text = args.slice(1).join(" ");
  } else {
    text = args.join(" ");
  }

  if (!text) {
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}encode binary hello`);
  }

  try {
    const d = await popcatJSON("encode", { text, type });
    if (d.error) return m.reply(`❌ ${d.error}`);

    // Response key is always "binary" regardless of type
    const result = d.binary || d.text || d.result || JSON.stringify(d);
    let txt = `🔐 Encode (${type})\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `Input: ${text}\n`;
    txt += `Output: ${result}\n`;
    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
