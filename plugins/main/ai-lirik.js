// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-lirik",
  alias: ["ai-lirik", "lirikai", "liriklaguai", "bikinlirik"],
  category: "ai",
  description: "Buat lirik lagu dengan AI (multi-model)",
  usage: ".ai-lirik [provider] <tema>",
  example: ".ai-lirik cinta | .ai-lirik groq persahabatan",
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
      const text = alyaHeader("Cara Pakai", "🎵") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-lirik <tema>*`,
          `◦ Multi-model: *${prefix}ai-lirik gemini <tema>*`,
          `◦ Contoh: *${prefix}ai-lirik patah hati*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Tulis lirik lagu bertema "${tema}" dalam bahasa Indonesia. Format: Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus. Emosional dan mudah diingat.`,
      systemPrompt: "Kamu adalah penulis lagu profesional Indonesia. Buat lirik yang catchy, emosional, dan punya rima yang baik.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Lirik", "🎵") + "\n\n" +
      bracketBox("🎵", "ʟɪʀɪᴋ ʟᴀɢᴜ", [
        `◦ Tema: *${tema}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-lirik <tema> untuk lirik lain`);
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
