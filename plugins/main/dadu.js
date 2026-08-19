// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const pluginConfig = {
  name: "dadu",
  alias: ["dadu", "dice", "daduroll", "kocokdadu"],
  category: "fun",
  description: "Lempar dadu random 1-6",
  usage: ".dadu",
  example: ".dadu",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const result = Math.floor(Math.random() * 6) + 1;
    const emoji = DICE_FACES[result - 1];

    const text = alyaHeader("Dadu", "🎲") + "\n\n" +
      bracketBox("🎲", "ʟᴇᴍᴘᴀʀ ᴅᴀᴅᴜ", [
        `◦ Hasil: *${emoji} ${result}*`,
      ]) + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}dadu untuk lempar lagi`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text = alyaHeader("Gagal", "❌") + "\n\n" + bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`, `◦ Alasan: *${error.message}*`,
    ]) + "\n\n" + separator() + "\n" + tipText(`Coba lagi nanti`);
    await m.reply(text);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
