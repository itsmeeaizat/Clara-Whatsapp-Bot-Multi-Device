import { popcatImage } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "oogway",
  alias: ["masteroogway", "oogwayquote"],
  category: "maker",
  description: "Buat quote Master Oogway",
  usage: ".oogway text",
  example: ".oogway There are no accidents",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const text = m.text?.trim() || "";
    if (!text) {
      await m.reply("Penggunaan: .oogway <teks>\nContoh: .oogway There are no accidents");
      return { handled: true };
    }

    const buf = await popcatImage("oogway", { text });
    await sock.sendMessage(m.chat, { image: buf, caption: `Master Oogway: "${text}"` }, { quoted: m });
  } catch (error) {
    await m.reply(`Gagal membuat quote Oogway: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
