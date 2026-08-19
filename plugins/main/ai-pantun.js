// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-pantun",
  alias: ["ai-pantun", "pantunai", "pantun", "bikinpantun"],
  category: "ai",
  description: "Buat pantun dengan AI (multi-model)",
  usage: ".ai-pantun [provider] <tema>",
  example: ".ai-pantun cinta | .ai-pantun gemini cinta",
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
      const text = alyaHeader("Cara Pakai", "🎭") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-pantun <tema>*`,
          `◦ Multi-model: *${prefix}ai-pantun gemini <tema>*`,
          `◦ Contoh: *${prefix}ai-pantun cinta*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Buatkan 3 pantun bertema "${tema}" dalam bahasa Indonesia. Format pantun 4 baris (ABAB). Balas hanya pantunnya saja.`,
      systemPrompt: "Kamu adalah penyair pantun Indonesia yang ahli. Buat pantun yang lucu, bijak, atau romantis sesuai tema.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Pantun", "🎭") + "\n\n" +
      bracketBox("🎭", "ᴘᴀɴᴛᴜɴ", [
        `◦ Tema: *${tema}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-pantun <tema> untuk pantun lain`);
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
