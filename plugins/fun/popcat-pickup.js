// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { popcatJSON } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "pickup",
  alias: ["pickupline", "pickuplines"],
  category: "fun",
  description: "Dapatkan gombalan / pickup line acak",
  usage: ".pickup",
  example: ".pickup",
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
    const data = await popcatJSON("pickuplines");
    const line = data.pickupline || data.result || "Tidak ada gombalan ditemukan.";

    await m.reply(`💌 *Pickup Line:*\n\n${line}`);
  } catch (error) {
    await m.reply(`Gagal mendapatkan pickup line: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
