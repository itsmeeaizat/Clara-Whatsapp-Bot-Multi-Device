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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `git_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const url = m.text?.trim();

    if (!url) {
      const text =
        alyaHeader("Cara Pakai", "🐙") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}gitclone <link repo>*`,
          `◦ Contoh: *${prefix}gitclone https://github.com/xxx/yyy*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const zipUrl = url.replace(/\/?$/, "") + "/archive/refs/heads/main.zip";
    const response = await axios.get(zipUrl, { responseType: "arraybuffer", maxRedirects: 5 });
    const buffer = Buffer.from(response.data);
    const filePath = tempPath(".zip");
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      mimetype: "application/zip",
      fileName: `repo_${Date.now()}.zip`,
    });

    const text =
      alyaHeader("Git Clone", "🐙") +
      "\n\n" +
      bracketBox("🐙", "ᴅᴏᴡɴʟᴏᴀᴅ", [
        `◦ Repo: *${url}*`,
        "◦ Format: *ZIP*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}gitclone <link> untuk clone repo lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
  name: "gitclone",
  alias: ["gitclone", "clonegit", "githubdl", "gitrepo"],
  category: "tools",
  description: "Clone repo GitHub menjadi ZIP",
  usage: ".gitclone <link repo>",
  example: ".gitclone https://github.com/xxx/yyy",
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
