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
function ensureTmp() { if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true }); }
function tempPath(ext) { ensureTmp(); return path.join(TMP_DIR, `sgif_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`); }

const pluginConfig = {
  name: "stickergif",
  alias: ["stickergif", "sgif", "stcgif", "gifstiker"],
  category: "sticker",
  description: "Buat sticker GIF/animasi dari video pendek",
  usage: "Reply video pendek dengan .stickergif",
  example: ".stickergif (reply video)",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const quoted = m.quoted;

    if (!quoted || !quoted.message?.videoMessage) {
      const text = alyaHeader("Cara Pakai", "🎬") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Reply video pendek dengan *${prefix}stickergif*`,
          `◦ Durasi maksimal: *10 detik*`,
        ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const buffer = await quoted.download();
    const sharp = (await import("sharp")).default;

    // Convert video to animated webp (sticker gif)
    const outPath = tempPath(".webp");
    await sharp(buffer, { animated: true })
      .resize(512, 512, { fit: "contain" })
      .webp({ quality: 80 })
      .toFile(outPath);

    await sock.sendMessage(m.chat, {
      sticker: fs.readFileSync(outPath),
    }, { quoted: m });

    try { fs.unlinkSync(outPath); } catch {}

    const info = alyaHeader("Sticker GIF", "🎬") + "\n\n" +
      bracketBox("🎬", "ʀᴇꜱᴜʟᴛ", ["◦ Status: *Berhasil*"]) + "\n\n" +
      separator() + "\n" + tipText(`Reply video dengan ${prefix}stickergif untuk sticker lain`);
    await m.reply(info);
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
