import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "funfact",
  alias: ["funfact", "funfactid", "faktaunik", "fakta"],
  category: "fun",
  description: "Fakta unik & menarik",
  usage: ".funfact",
  example: ".funfact",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const res = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random", { timeout: 10000 });

    const fact = res.data?.text;
    if (!fact) throw new Error("Gagal mengambil fakta");

    const text = alyaHeader("Fun Fact", "🧠") + "\n\n" +
      bracketBox("🧠", "ꜰᴀᴋᴛᴀ ᴜɴɪᴋ", [
        `◦ Fakta: *${fact}*`,
      ]) + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}funfact untuk fakta lain`);

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
