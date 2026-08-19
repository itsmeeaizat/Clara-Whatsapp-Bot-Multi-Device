// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "nhentai",
  alias: ["nhentai", "nh"],
  category: "search",
  description: "Plugin ini dinonaktifkan",
  usage: ".nhentai",
  example: ".nhentai",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: false,
};

async function handler(m, { sock, config: botConfig }) {
  const prefix = botConfig.command?.prefix || ".";
  const text =
    alyaHeader("Disabled", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴅɪꜱᴀʙʟᴇᴅ", [
      "◦ Plugin ini dinonaktifkan",
      "◦ API tidak tersedia",
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}menu untuk kembali`);

  await m.reply(text);
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
