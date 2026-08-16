import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "dadjoke",
  alias: ["dadjoke", "joke", "lelucon", "jokeen"],
  category: "fun",
  description: "Random dad joke (lelucon dad)",
  usage: ".dadjoke",
  example: ".dadjoke",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const res = await axios.get("https://icanhazdadjoke.com/", {
      headers: { Accept: "application/json" }, timeout: 10000,
    });

    const joke = res.data?.joke;
    if (!joke) throw new Error("Gagal mengambil joke");

    const text = alyaHeader("Dad Joke", "😂") + "\n\n" +
      bracketBox("😂", "ʟᴇʟᴜᴄᴏɴ", [
        `◦ Joke: *${joke}*`,
      ]) + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}dadjoke untuk joke lain`);

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
