// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "lucky",
  alias: ["lucky", "luck", "beruntung", "lucky"],
  category: "game",
  description: "Coba peruntunganmu",
  usage: ".lucky",
  example: ".lucky",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const roll = Math.random() * 100;
    let result = "";
    if (roll < 10) result = "Ulang tahun, dapat 100 Gold!";
    else if (roll < 30) result = "Dapat kupon 50 Gold.";
    else if (roll < 55) result = "Dapat 20 Gold.";
    else result = "Tidak dapat apa-apa hari ini.";

    const text =
      alyaHeader("Lucky", "🍀") +
      "\n\n" +
      bracketBox("🍀", "ғᴏʀᴛᴜɴᴇ", [
        `◦ Hasil: *${result}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}lucky untuk coba lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        `◦ Status: *Gagal*`,
        `◦ Alasan: *${error.message}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
