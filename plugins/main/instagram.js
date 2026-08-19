// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `ig_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "📸") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}instagram <link>*`,
          `◦ Contoh: *${prefix}instagram https://instagram.com/p/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { igdl } = await import("btch-downloader");
    const data = await igdl(url);

    if (!data?.status || (!data?.[0]?.url && !data?.[0]?.thumbnail))
      throw new Error("Instagram API returned no data");

    const mediaList = Array.isArray(data) ? data : [data];
    for (const media of mediaList) {
      const mediaUrl = media.url || media.download_link;
      if (!mediaUrl) continue;

      const isVideo = media.type === "video" || mediaUrl.includes(".mp4");
      const ext = isVideo ? ".mp4" : ".jpg";
      const filePath = tempPath(ext);
      const res = await axios.get(mediaUrl, { responseType: "arraybuffer", timeout: 60000 });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      if (isVideo) {
        await sock.sendMessage(m.chat, {
          video: fs.readFileSync(filePath),
          caption: `📸 *Instagram Download*\n◦ Status: *Berhasil*`,
          mimetype: "video/mp4",
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, {
          image: fs.readFileSync(filePath),
          caption: `📸 *Instagram Download*\n◦ Status: *Berhasil*`,
        }, { quoted: m });
      }

      try { fs.unlinkSync(filePath); } catch {}
    }

    const text =
      alyaHeader("Instagram", "📸") +
      "\n\n" +
      bracketBox("📸", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Link: *${url}*`,
        `◦ Total: *${mediaList.length} media*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}instagram <link> untuk download media lain`);

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

const pluginConfig = {
  name: "instagram",
  alias: ["instagram", "igdl", "instagramdownloader"],
  category: "download",
  description: "Download media dari Instagram",
  usage: ".instagram <link>",
  example: ".instagram https://instagram.com/p/xxxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

export default {
  config: pluginConfig,
  handler,
};
