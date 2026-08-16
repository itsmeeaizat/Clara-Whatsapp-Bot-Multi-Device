import fs from "fs";
import path from "path";
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const TMP_DIR = path.join(process.cwd(), "tmp");
function ensureTmp() { if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true }); }
function tempPath(ext) { ensureTmp(); return path.join(TMP_DIR, `prev_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`); }

const pluginConfig = {
  name: "previewmusik",
  alias: ["previewmusik", "preview", "previewlagu", "prevmusic"],
  category: "music",
  description: "Preview lagu dari iTunes (30 detik)",
  usage: ".previewmusik <judul lagu>",
  example: ".previewmusik adele hello",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();
    if (!query) {
      const text = alyaHeader("Cara Pakai", "🎧") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}previewmusik <judul lagu>*`,
        `◦ Contoh: *${prefix}previewmusik adele hello*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const res = await axios.get("https://itunes.apple.com/search", {
      params: { term: query, limit: 1, media: "music" }, timeout: 10000,
    });

    const track = res.data?.results?.[0];
    if (!track?.previewUrl) throw new Error("Preview tidak tersedia");

    // Download preview
    const filePath = tempPath(".m4a");
    const audioRes = await axios.get(track.previewUrl, { responseType: "arraybuffer", timeout: 15000 });
    fs.writeFileSync(filePath, Buffer.from(audioRes.data));

    await sock.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mp4",
      ptt: false,
      fileName: `${track.trackName} - preview.m4a`,
    }, { quoted: m });

    try { fs.unlinkSync(filePath); } catch {}

    const text = alyaHeader("Preview Musik", "🎧") + "\n\n" +
      bracketBox("🎧", "ᴘʀᴇᴠɪᴇᴡ", [
        `◦ Judul: *${track.trackName}*`,
        `◦ Artist: *${track.artistName}*`,
        `◦ Album: *${track.collectionName || "-"}*`,
        "◦ Durasi: *30 detik*",
        "◦ Status: *Berhasil*",
      ]) + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}previewmusik <judul> untuk preview lain`);

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
