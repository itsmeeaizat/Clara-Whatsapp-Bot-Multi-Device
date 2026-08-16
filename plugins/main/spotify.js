import fs from "fs";
import path from "path";
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
  return path.join(TMP_DIR, `sp_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "🎵") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}spotify <link>*`,
          `◦ Contoh: *${prefix}spotify https://open.spotify.com/track/xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { spotify } = await import("btch-downloader");
    const data = await spotify(url);

    if (!data?.status) throw new Error("Spotify API returned no data");

    const downloadUrl = data.url || data.download || data.link;
    if (!downloadUrl) throw new Error("No download URL found");

    const filePath = tempPath(".mp3");
    const axios = (await import("axios")).default;
    const res = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 60000 });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await sock.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${data.title || "spotify"}.mp3`,
    }, { quoted: m });

    try { fs.unlinkSync(filePath); } catch {}

    const text =
      alyaHeader("Spotify", "🎵") +
      "\n\n" +
      bracketBox("🎵", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Judul: *${data.title || url}*`,
        `◦ Artist: *${data.artist || "-"}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}spotify <link> untuk download lagu lain`);

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
  config: {
    name: "spotify",
    alias: ["spotify", "spdl", "spotifydl"],
    category: "music",
    description: "Download lagu dari Spotify",
    usage: ".spotify <link>",
    example: ".spotify https://open.spotify.com/track/xxxx",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
  },
  handler,
};
