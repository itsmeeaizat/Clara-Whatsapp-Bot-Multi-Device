import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-paraphrase",
  alias: ["ai-paraphrase", "paraphrase", "parafrase", "rephrase"],
  category: "ai",
  description: "Parafrase teks dengan AI (multi-model)",
  usage: ".ai-paraphrase [provider] <teks>",
  example: ".ai-paraphrase saya suka makan | .ai-paraphrase gemini saya suka makan",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/\s+/);
    let providerArg = null;
    let teks = m.text?.trim();

    if (args[0] && DEFAULT_PROVIDERS[args[0].toLowerCase()]) {
      providerArg = args[0].toLowerCase();
      teks = args.slice(1).join(" ").trim();
    }

    if (!teks) {
      const text = alyaHeader("Cara Pakai", "🔄") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-paraphrase <teks>*`,
          `◦ Multi-model: *${prefix}ai-paraphrase gemini <teks>*`,
          `◦ Contoh: *${prefix}ai-paraphrase saya suka belajar*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Parafrase teks berikut dalam bahasa Indonesia dengan 3 versi berbeda (formal, santai, kreatif):\n\n"${teks}"`,
      systemPrompt: "Kamu adalah ahli bahasa Indonesia. Parafrase dengan makna yang sama tapi kata yang berbeda.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Paraphrase", "🔄") + "\n\n" +
      bracketBox("🔄", "ᴘᴀʀᴀꜰʀᴀꜱᴇ", [
        `◦ Teks: *${teks.substring(0, 50)}${teks.length > 50 ? "..." : ""}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-paraphrase <teks> untuk parafrase lagi`);
    await m.reply(text);
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
