import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAI } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "ai-detector",
  alias: ["ai-detector", "detectai", "isai", "humanorai", "checkai"],
  category: "ai",
  description: "Deteksi apakah teks/materi berpotensi AI-generated",
  usage: ".ai-detector <teks> | reply teks",
  example: ".ai-detector <teks yang mau dicek>",
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
    const text = m.quoted?.text ? m.quoted.text : raw.replace(/^\.ai-detector\s+/i, "").trim();

    if (!text) {
      const out =
        alyaHeader("Cara Pakai", "🕵️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-detector <teks>*`,
          `◦ Atau reply pesan dengan *${prefix}ai-detector*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(out);
      return { handled: true };
    }

    const prompt = `Analisis apakah teks berikut tampak ditulis oleh AI atau manusia. Berikan skor kemiripan AI (0-100) dan alasan singkat dalam bahasa Indonesia:\n\n${text.slice(0, 4000)}`;
    const reply = await callAI({
      providerKey: "openai",
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      apiKey: (botConfig.aiHelp || {}).apiKey,
      apiEndpoint: (botConfig.aiHelp || {}).apiEndpoint,
    });

    const out =
      alyaHeader("AI Detector", "🕵️") +
      "\n\n" +
      bracketBox("🕵️", "ᴀɴᴀʟɪꜱɪꜱ", [
        `◦ Hasil: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai-detector <teks> untuk cek lagi`) +
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

export default {
  config: pluginConfig,
  handler,
};
