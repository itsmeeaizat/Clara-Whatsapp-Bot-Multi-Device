// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAI } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "aibrowse",
  alias: ["aibrowse", "browseai", "browse", "deepresearch", "researchai"],
  category: "ai",
  description: "Telusuri topik dan buat ringkasan riset singkat",
  usage: ".aibrowse <pertanyaan>",
  example: ".aibrowse Tren AI 2026",
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
    const prompt = m.text?.trim();

    if (!prompt) {
      const text =
        alyaHeader("Cara Pakai", "🔎") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}aibrowse <pertanyaan>*`,
          `◦ Contoh: *${prefix}aibrowse Tren AI 2026*`,
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
        { role: "system", content: "Kamu adalah asisten riset. Berikan ringkasan terstruktur, poin penting, dan sumber yang mungkin relevan dalam bahasa Indonesia." },
        { role: "user", content: prompt },
      ],
      apiKey: (botConfig.aiHelp || {}).apiKey,
      apiEndpoint: (botConfig.aiHelp || {}).apiEndpoint,
    });

    const text =
      alyaHeader("AI Browse", "🔎") +
      "\n\n" +
      bracketBox("🔎", "ʀᴇꜱᴇᴀʀᴄʜ", [
        `◦ Pertanyaan: *${prompt.slice(0, 200)}${prompt.length > 200 ? "..." : ""}*`,
        `◦ Hasil: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}aibrowse <pertanyaan> untuk cari lagi`) +
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
