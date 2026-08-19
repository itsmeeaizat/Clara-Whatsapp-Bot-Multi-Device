// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
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
  return path.join(TMP_DIR, `tts_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const text = m.text?.trim();

    if (!text) {
      const reply =
        alyaHeader("Cara Pakai", "🔊") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}tts <teks>*`,
          `◦ Contoh: *${prefix}tts Halo dunia*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    const { getAudioUrl } = await import("google-tts-api");
    const audioUrl = getAudioUrl(text, { lang: "id", slow: false });

    const filePath = tempPath(".mp3");
    const axios = (await import("axios")).default;
    const res = await axios.get(audioUrl, { responseType: "arraybuffer", timeout: 15000 });
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await sock.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: "audio/mpeg",
      ptt: false,
    }, { quoted: m });

    try { fs.unlinkSync(filePath); } catch {}

    const info =
      alyaHeader("TTS", "🔊") +
      "\n\n" +
      bracketBox("🔊", "ᴛᴇxᴛ ᴛᴏ ꜱᴘᴇᴇᴄʜ", [
        `◦ Teks: *${text}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}tts <teks> untuk audio lain`);

    await m.reply(info);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const reply =
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

    await m.reply(reply);
  }

  return { handled: true };
}

const pluginConfig = {
  name: "tts",
  alias: ["tts", "texttospeech", "suara", "speak"],
  category: "tools",
  description: "Ubah teks menjadi audio (Google TTS)",
  usage: ".tts <teks>",
  example: ".tts Halo dunia",
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
