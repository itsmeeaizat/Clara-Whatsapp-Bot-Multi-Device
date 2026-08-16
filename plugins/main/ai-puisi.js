import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-puisi",
  alias: ["ai-puisi", "puisiai", "puisi", "bikinpuisi"],
  category: "ai",
  description: "Buat puisi dengan AI (multi-model)",
  usage: ".ai-puisi [provider] <tema>",
  example: ".ai-puisi laut | .ai-puisi gemini laut",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/\s+/);
    let providerArg = null;
    let tema = m.text?.trim();

    if (args[0] && DEFAULT_PROVIDERS[args[0].toLowerCase()]) {
      providerArg = args[0].toLowerCase();
      tema = args.slice(1).join(" ").trim();
    }

    if (!tema) {
      const text = alyaHeader("Cara Pakai", "✍️") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-puisi <tema>*`,
          `◦ Multi-model: *${prefix}ai-puisi gemini <tema>*`,
          `◦ Contoh: *${prefix}ai-puisi laut*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Tulis puisi indah bertema "${tema}" dalam bahasa Indonesia. Puisi 2-3 bait, puitis dan emosional.`,
      systemPrompt: "Kamu adalah penyair Indonesia yang menghasilkan karya puitis, indah, dan bermakna mendalam.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Puisi", "✍️") + "\n\n" +
      bracketBox("✍️", "ᴘᴜɪꜱɪ", [
        `◦ Tema: *${tema}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-puisi <tema> untuk puisi lain`);
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
