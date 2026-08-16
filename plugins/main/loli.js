import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "loli",
  alias: ["loli"],
  category: "search",
  description: "Random gambar loli/anime",
  usage: ".loli",
  example: ".loli",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const res = await axios.get("https://nekos.life/api/v2/img/neko", { timeout: 10000 });
    const imageUrl = res.data?.url;
    if (!imageUrl) throw new Error("Gagal mengambil gambar");

    const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
    await sock.sendMessage(m.chat, {
      image: Buffer.from(imgRes.data),
      caption: `🐱 *Loli*\n◦ Source: *nekos.life*`,
    }, { quoted: m });

    const text =
      alyaHeader("Loli", "🐱") +
      "\n\n" +
      bracketBox("🐱", "ʜᴀꜱɪʟ", [
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}loli untuk gambar lain`);

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
