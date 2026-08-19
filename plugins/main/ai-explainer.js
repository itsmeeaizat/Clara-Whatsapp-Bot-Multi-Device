// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAI } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "ai-explainer",
  alias: ["ai-explainer", "explain", "jelaskan", "mengerti", "belajar"],
  category: "ai",
  description: "Jelaskan topik apapun dengan AI",
  usage: ".ai-explainer <topik>",
  example: ".ai-explainer blockchain",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = m.text?.trim() || "";
    const topic = raw.replace(/^\.ai-explainer\s+/i, "").trim();

    if (!topic) {
      const text =
        alyaHeader("Cara Pakai", "📚") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-explainer <topik>*`,
          `◦ Contoh: *${prefix}ai-explainer blockchain*`,
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
        { role: "system", content: "Jelaskan topik berikut dengan bahasa sederhana, akurat, dan bergaya Feynman dalam bahasa Indonesia." },
        { role: "user", content: `Jelaskan: ${topic}` },
      ],
      apiKey: (botConfig.aiHelp || {}).apiKey,
      apiEndpoint: (botConfig.aiHelp || {}).apiEndpoint,
    });

    const text =
      alyaHeader("AI Explainer", "📚") +
      "\n\n" +
      bracketBox("📚", "ᴘᴇɴᴊᴇʟᴀꜱᴀɴ", [
        `◦ Topik: *${topic}*`,
        `◦ Hasil: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai-explainer <topik> untuk topik lain`) +
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
