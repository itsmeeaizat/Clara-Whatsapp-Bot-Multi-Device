/**
 * Decode Text — popcat.xyz
 * Usage: .decode <type> <encoded text>
 * Type: binary (default), base64, hex, morse, atbash, etc.
 */

import { popcatJSON } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "decode",
  alias: ["decodetext", "dec"],
  category: "tools",
  description: "Decode binary/base64/hex/morse ke teks",
  usage: ".decode <type> <encoded text>",
  example: ".decode binary 0110100001100101011011000110110001101111",
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
      `Format salah!\nContoh: ${m.prefix || "."}decode binary 0110100001100101011011000110110001101111`
    );
  }

  let type = "binary";
  let text = "";
  if (args.length >= 2 && ["binary", "base64", "hex", "morse", "atbash"].includes(args[0].toLowerCase())) {
    type = args[0].toLowerCase();
    text = args.slice(1).join(" ");
  } else {
    text = args.join(" ");
  }

  if (!text) {
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}decode binary 0110100001100101011011000110110001101111`);
  }

  try {
    // popcat decode uses "binary" as the param name, not "text"
    const d = await popcatJSON("decode", { binary: text });
    if (d.error) return m.reply(`❌ ${d.error}`);

    const result = d.text || d.result || JSON.stringify(d);
    let txt = `🔓 Decode (${type})\n`;
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
