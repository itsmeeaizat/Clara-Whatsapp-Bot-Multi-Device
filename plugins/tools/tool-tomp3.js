/**
 * To MP3 — Convert media to audio
 * Convert video/voice note to MP3 using ffmpeg.
 * Usage: reply to media with .tomp3
 */

import { exec } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";

const execAsync = promisify(exec);

const pluginConfig = {
  name: "tomp3",
  alias: ["toaudio", "mp3", "tovoice"],
  category: "tools",
  description: "Konversi video/voice note ke MP3",
  usage: ".tomp3 (reply ke media)",
  example: ".tomp3",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!m.quoted) return m.reply("Reply video atau voice note!");
    const mime = m.quoted.mimetype || "";
    if (!/video|audio/.test(mime)) return m.reply("Reply video atau audio!");

    await m.reply("⏳ Konversi ke MP3...");

    const buf = await m.quoted.download();
    if (!buf) return m.reply("Gagal download media.");

    const tmp = join(tmpdir(), `clara_tomp3_${Date.now()}`);
    const inp = `${tmp}_in`;
    const out = `${tmp}.mp3`;

    // Detect input format
    const ext = mime.includes("video") ? "mp4" : mime.includes("webm") ? "webm" : "ogg";
    writeFileSync(`${inp}.${ext}`, buf);

    // Convert with ffmpeg
    await execAsync(`ffmpeg -i "${inp}.${ext}" -vn -acodec libmp3lame -q:a 2 "${out}" -y`, { timeout: 30000 });

    if (!existsSync(out)) throw new Error("ffmpeg gagal konversi");

    const mp3Buf = readFileSync(out);

    // Cleanup
    try { unlinkSync(`${inp}.${ext}`); } catch {}
    try { unlinkSync(out); } catch {}

    await sock.sendMessage(m.chat, {
      audio: mp3Buf,
      mimetype: "audio/mpeg",
      filename: "converted.mp3",
    }, { quoted: m });
  } catch (err) {
    const msg = String(err.message).slice(0, 100);
    if (msg.includes("ffmpeg") || msg.includes("not found")) {
      await m.reply("❌ ffmpeg tidak terinstall di server.");
    } else {
      await m.reply(`❌ ${msg}`);
    }
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
