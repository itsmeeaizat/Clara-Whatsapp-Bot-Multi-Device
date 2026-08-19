// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAI } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "aiidea",
  alias: ["aiidea", "ide", "brainstorm", "ideai", "brainstormai"],
  category: "ai",
  description: "Dapatkan ide/ brainstorming dengan AI",
  usage: ".aiidea <topik>",
  example: ".aiidea ide konten TikTok untuk kuliner",
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
    const topic = raw.replace(/^\.aiidea\s+/i, "").trim();

    if (!topic) {
      const text =
        alyaHeader("Cara Pakai", "💡") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}aiidea <topik>*`,
          `◦ Contoh: *${prefix}aiidea ide bisnis Modal kecil*`,
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
        { role: "system", content: "Kamu adalah konsultan kreatif. Berikan 5-7 ide actionable yang spesifik, singkat, dan mudah dijalankan." },
        { role: "user", content: `Berikan ide untuk: ${topic}` },
      ],
      apiKey: (botConfig.aiHelp || {}).apiKey,
      apiEndpoint: (botConfig.aiHelp || {}).apiEndpoint,
    });

    const text =
      alyaHeader("AI Idea", "💡") +
      "\n\n" +
      bracketBox("💡", "ɪᴅᴇ", [
        `◦ Topik: *${topic}*`,
        `◦ Hasil: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}aiidea <topik> untuk ide lain`) +
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
