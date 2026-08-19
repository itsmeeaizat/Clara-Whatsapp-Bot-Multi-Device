// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "fototiktok",
  alias: ["fototiktok", "tiktokphoto", "ttpict"],
  category: "download",
  description: "Download foto dari TikTok",
  usage: ".fototiktok <link>",
  example: ".fototiktok https://tiktok.com/@user/video/xxx",
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
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "📸") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}fototiktok <link>*`,
          `◦ Contoh: *${prefix}fototiktok https://tiktok.com/@user/video/xxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { ttdl } = await import("btch-downloader");
    const data = await ttdl(url);

    if (!data?.status) throw new Error("TikTok API returned no data");

    // Send thumbnail if available
    if (data.thumbnail) {
      const res = await axios.get(data.thumbnail, { responseType: "arraybuffer", timeout: 15000 });
      await sock.sendMessage(m.chat, {
        image: Buffer.from(res.data),
        caption: `📸 *Foto TikTok*\n◦ Author: *${data.author || data.nickname || "-"}*`,
      }, { quoted: m });
    }

    // Send any photo slides
    if (data.video && Array.isArray(data.video) && data.video.length > 0) {
      for (const photo of data.video) {
        const photoUrl = photo.url || photo;
        if (typeof photoUrl !== "string") continue;
        try {
          const res = await axios.get(photoUrl, { responseType: "arraybuffer", timeout: 15000 });
          await sock.sendMessage(m.chat, {
            image: Buffer.from(res.data),
            caption: `📸 *Foto TikTok*`,
          }, { quoted: m });
        } catch {}
      }
    }

    const text =
      alyaHeader("Foto TikTok", "📸") +
      "\n\n" +
      bracketBox("📸", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Link: *${url}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}fototiktok <link> untuk foto lain`);

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
