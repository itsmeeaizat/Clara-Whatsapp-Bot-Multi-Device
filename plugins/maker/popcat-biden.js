import { popcatImage } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "biden",
  alias: ["bidentweet"],
  category: "maker",
  description: "Buat tweet palsu dari Joe Biden",
  usage: ".biden text",
  example: ".biden Hello World",
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
      await m.reply("Penggunaan: .biden <teks>\nContoh: .biden Hello World");
      return { handled: true };
    }

    const buf = await popcatImage("biden", { text });
    await sock.sendMessage(m.chat, { image: buf, caption: `Biden Tweet: "${text}"` }, { quoted: m });
  } catch (error) {
    await m.reply(`Gagal membuat tweet Biden: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
