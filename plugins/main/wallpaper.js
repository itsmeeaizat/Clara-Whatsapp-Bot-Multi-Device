import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "wallpaper",
  alias: ["wallpaper", "wp", "wall"],
  category: "search",
  description: "Cari wallpaper",
  usage: ".wallpaper <query>",
  example: ".wallpaper anime",
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
    const query = m.text?.trim() || "wallpaper hd";

    const { pinterest } = await import("btch-downloader");
    const data = await pinterest(`${query} wallpaper hd`);

    if (!data?.status) throw new Error("Gagal mencari wallpaper");

    const images = Array.isArray(data) ? data : [data];
    if (!images.length) throw new Error("Tidak ada wallpaper ditemukan");

    const selected = images.slice(0, 3);
    for (const item of selected) {
      const imageUrl = item?.url || item?.image || item;
      if (typeof imageUrl !== "string") continue;

      try {
        const res = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
        await sock.sendMessage(m.chat, {
          image: Buffer.from(res.data),
          caption: `🖼️ *Wallpaper*\n◦ Query: *${query}*`,
        }, { quoted: m });
      } catch {}
    }

    const text =
      alyaHeader("Wallpaper", "🖼️") +
      "\n\n" +
      bracketBox("🖼️", "ʜᴀꜱɪʟ", [
        `◦ Query: *${query}*`,
        `◦ Total: *${selected.length} wallpaper*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}wallpaper <query> untuk cari lagi`);

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
