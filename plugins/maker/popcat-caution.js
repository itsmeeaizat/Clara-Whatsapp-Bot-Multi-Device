import { popcatImage } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "caution",
  alias: ["cautionsign"],
  category: "maker",
  description: "Buat papan peringatan caution",
  usage: ".caution text",
  example: ".caution Danger Zone",
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
      await m.reply("Penggunaan: .caution <teks>\nContoh: .caution Danger Zone");
      return { handled: true };
    }

    const buf = await popcatImage("caution", { text });
    await sock.sendMessage(m.chat, { image: buf, caption: `Caution: ${text}` }, { quoted: m });
  } catch (error) {
    await m.reply(`Gagal membuat tanda caution: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
