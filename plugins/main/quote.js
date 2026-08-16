import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "quote",
  alias: ["quote", "quotes", "katabijak"],
  category: "info",
  description: "Random quote/kata bijak",
  usage: ".quote",
  example: ".quote",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const res = await axios.get("https://zenquotes.io/api/random", { timeout: 10000 });
    const data = res.data?.[0];
    if (!data?.q) throw new Error("Gagal mengambil quote");

    const text =
      alyaHeader("Quote", "💬") +
      "\n\n" +
      bracketBox("💬", "ǫᴜᴏᴛᴇ", [
        `◦ Quote: *"${data.q}"*`,
        `◦ Author: *${data.a || "Unknown"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}quote untuk quote lain`);

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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
