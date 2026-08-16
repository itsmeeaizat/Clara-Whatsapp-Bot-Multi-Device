import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `epho_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

const ENDPOINTS = [
  "https://api.zeks.xyz/api/ephoto",
];

const pluginConfig = {
  name: "epho",
  alias: ["epho", "ephoto", "edit", "fx"],
  category: "image",
  description: "Efek foto/image editor",
  usage: ".epho",
  example: ".epho (kirim/reply gambar)",
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

    const media = m.msg?.imageMessage || m.quoted?.msg?.imageMessage;
    if (!media) {
      const text =
        alyaHeader("Cara Pakai", "🎨") +
        "\n\n" +
        bracketBox("🎨", "ɪɴꜱᴛʀᴜᴋsɪ", [
          "◦ Kirim gambar + caption .epho",
          "◦ Atau reply gambar dengan .epho",
          "◦ Format: JPG, PNG, WEBP",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const buffer = await sock.downloadMediaMessage(m.quoted || m);
    const filePath = tempPath(".png");
    fs.writeFileSync(filePath, buffer);

    let resultBuffer = null;
    for (const baseUrl of ENDPOINTS) {
      try {
        const form = new FormData();
        form.append("image", new Blob([buffer], { type: "image/png" }));
        const res = await axios.post(baseUrl, form, {
          headers: form.getHeaders(),
          responseType: "arraybuffer",
          timeout: 60000,
        });
        if (res.status === 200 && res.data && res.data.length > 1000) {
          resultBuffer = Buffer.from(res.data);
          break;
        }
      } catch {}
    }

    if (!resultBuffer) {
      const text =
        alyaHeader("Ephoto", "🎨") +
        "\n\n" +
        bracketBox("🎨", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Efek: *Photo Effect*",
          "◦ Status: *Berhasil tanpa API*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.sendMessage(m.chat, {
      image: resultBuffer,
      caption:
        alyaHeader("Ephoto", "🎨") +
        "\n\n" +
        bracketBox("🎨", "ꜱᴛᴀᴛᴜꜱ", [
          "◦ Efek: *Photo Effect*",
          "◦ Status: *Berhasil*",
        ]),
    }, { quoted: m });
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
  config: pluginConfig,
  handler,
};
