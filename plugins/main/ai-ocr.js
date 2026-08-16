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
  return path.join(TMP_DIR, `aiocr_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const media = m.msg?.imageMessage || m.quoted?.msg?.imageMessage;
    if (!media) {
      const text =
        alyaHeader("Cara Pakai", "🔍") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-ocr*`,
          `◦ Kirim/reply foto, lalu ketik *${prefix}ai-ocr*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const buffer = await sock.downloadMediaMessage(m.quoted || m);
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    const aiConfig = botConfig.aiHelp || {};
    const apiKey = String(aiConfig.apiKey || "");
    const apiEndpoint = String(aiConfig.apiEndpoint || "https://api.openai.com/v1/chat/completions");
    const model = String(aiConfig.model || "gpt-4o-mini");

    if (!apiKey) {
      const text =
        alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          "◦ Status: *Gagal*",
          "◦ Alasan: *API key AI belum diisi.*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Isi `botConfig.aiHelp.apiKey` dulu, lalu coba lagi.");

      await m.reply(text);
      return { handled: true };
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Ekstrak semua teks dari gambar ini. Jika ada teks Indonesia, pertahankan bahasa asli. Jika ada teks lain, sebutkan bahasa dan isinya." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "Tidak ada teks terdeteksi.";

    const out =
      alyaHeader("AI OCR", "🔍") +
      "\n\n" +
      bracketBox("🔍", "ᴛᴇxᴛ", [
        `◦ Hasil: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai-ocr untuk ekstrak teks lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    await m.reply(out);
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
  name: "ai-ocr",
  alias: ["ai-ocr", "ocr", "readimg", "textimg", "scantext"],
  category: "ai",
  description: "Ekstrak teks dari gambar",
  usage: ".ai-ocr (reply foto)",
  example: ".ai-ocr (reply foto teks)",
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
