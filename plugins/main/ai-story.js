// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAI } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "ai-story",
  alias: ["ai-story", "storyai", "ceritaai", "aiwriter", "aistory"],
  category: "ai",
  description: "Tulis cerita pendek dengan AI",
  usage: ".ai-story <tema>",
  example: ".ai-story petualangan di kota futuristik",
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
    const raw = m.text?.trim() || "";
    const topic = raw.replace(/^\.ai-story\s+/i, "").trim();

    if (!topic) {
      const text =
        alyaHeader("Cara Pakai", "📖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-story <tema>*`,
          `◦ Contoh: *${prefix}ai-story romansa di SMA*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAI({
      providerKey: "openai",
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Kamu adalah penulis cerita. Tulis cerita pendek yang menarik, mengalir, dan punya konflik terstruktur dalam bahasa Indonesia." },
        { role: "user", content: `Tulis cerita pendek tentang: ${topic}` },
      ],
      apiKey: (botConfig.aiHelp || {}).apiKey,
      apiEndpoint: (botConfig.aiHelp || {}).apiEndpoint,
    });

    const text =
      alyaHeader("AI Story", "📖") +
      "\n\n" +
      bracketBox("📖", "ᴄᴇʀɪᴛᴀ", [
        `◦ Tema: *${topic}*`,
        `◦ Hasil: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai-story <tema> untuk cerita lain`) +
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

export default {
  config: pluginConfig,
  handler,
};
