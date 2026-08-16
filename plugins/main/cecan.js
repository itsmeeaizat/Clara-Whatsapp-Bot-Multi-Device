import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "cecan",
  alias: ["cecan", "cewek", "cewe"],
  category: "search",
  description: "Cari gambar cewek cantik",
  usage: ".cecan",
  example: ".cecan",
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

    const { pinterest } = await import("btch-downloader");
    const data = await pinterest("cewek cantik indonesia");

    if (!data?.status) throw new Error("Gagal mencari gambar");

    const images = Array.isArray(data) ? data : [data];
    if (!images.length) throw new Error("Tidak ada gambar ditemukan");

    const selected = images[Math.floor(Math.random() * Math.min(images.length, 10))];
    const imageUrl = selected?.url || selected?.image || selected;
    if (typeof imageUrl !== "string") throw new Error("No image URL");

    const res = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
    await sock.sendMessage(m.chat, {
      image: Buffer.from(res.data),
      caption: `🌸 *Cecan*\n◦ Status: *Berhasil*`,
    }, { quoted: m });

    const text =
      alyaHeader("Cecan", "🌸") +
      "\n\n" +
      bracketBox("🌸", "ʜᴀꜱɪʟ", [
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}cecan untuk gambar lain`);

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
