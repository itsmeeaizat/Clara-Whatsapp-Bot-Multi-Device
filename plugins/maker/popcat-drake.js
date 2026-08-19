// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { popcatImage } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "drake",
  alias: ["drakememe"],
  category: "maker",
  description: "Buat meme Drake dengan 2 teks",
  usage: ".drake text1 | text2",
  example: ".drake Coding JS | Coding Python",
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
    const parts = text.split("|").map((p) => p.trim());
    const text1 = parts[0] || "";
    const text2 = parts[1] || "";

    if (!text1 || !text2) {
      await m.reply("Penggunaan: .drake text1 | text2\nContoh: .drake Coding JS | Coding Python");
      return { handled: true };
    }

    const buf = await popcatImage("drake", { text1, text2 });
    await sock.sendMessage(m.chat, { image: buf, caption: `${text1} vs ${text2}` }, { quoted: m });
  } catch (error) {
    await m.reply(`Gagal membuat meme Drake: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
