import { popcatJSON } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "mock",
  alias: ["mocktext", "spongebobmock"],
  category: "fun",
  description: "Ubah teks menjadi gaya SpongeBob mock (sPoNgEbOb cAsE)",
  usage: ".mock <teks>",
  example: ".mock halo selamat pagi",
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
    const text = m.text?.trim() || m.quoted?.body || "";
    if (!text) {
      await m.reply("Penggunaan: .mock <teks> (atau reply pesan teks)\nContoh: .mock halo selamat pagi");
      return { handled: true };
    }

    const data = await popcatJSON("mock", { text });
    const mockedText = data.text || data.result || text;

    await m.reply(mockedText);
  } catch (error) {
    await m.reply(`Gagal membuat mock text: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
