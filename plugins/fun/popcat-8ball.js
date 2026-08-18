import { popcatJSON } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "8ball",
  alias: ["magic8ball", "eightball", "magicball"],
  category: "fun",
  description: "Tanya bola ajaib 8-ball",
  usage: ".8ball [pertanyaan]",
  example: ".8ball Apakah hari ini akan hujan?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  try {
    const question = m.text?.trim() || "";
    const data = await popcatJSON("8ball");
    const answer = data.answer || "Tidak ada jawaban.";

    let formattedText = "";
    if (question) {
      formattedText = `🎱 *8-Ball Magic*\n\n❓ *Pertanyaan:* ${question}\n💡 *Jawaban:* ${answer}`;
    } else {
      formattedText = `🎱 *8-Ball Magic:* ${answer}`;
    }

    await m.reply(formattedText);
  } catch (error) {
    await m.reply(`Gagal mendapatkan jawaban 8-ball: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
