// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-roast",
  alias: ["ai-roast", "roastai", "roast", "bakar"],
  category: "ai",
  description: "AI roast/bakar seseorang (multi-model)",
  usage: ".ai-roast [provider] <nama>",
  example: ".ai-roast Budi | .ai-roast gemini Budi",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/\s+/);
    let providerArg = null;
    let nama = m.text?.trim();

    if (args[0] && DEFAULT_PROVIDERS[args[0].toLowerCase()]) {
      providerArg = args[0].toLowerCase();
      nama = args.slice(1).join(" ").trim();
    }

    if (!nama) {
      const text = alyaHeader("Cara Pakai", "🔥") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-roast <nama>*`,
          `◦ Multi-model: *${prefix}ai-roast gemini <nama>*`,
          `◦ Contoh: *${prefix}ai-roast Budi*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Roast seseorang bernama "${nama}" dengan humor tajam tapi tidak kasar. 3-5 kalimat roast yang lucu dan pedas dalam bahasa Indonesia slang.`,
      systemPrompt: "Kamu adalah stand-up comedian Indonesia yang jago roast. Buat roast yang lucu, pedas, tapi tidak menyakiti hati.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Roast", "🔥") + "\n\n" +
      bracketBox("🔥", "ʀᴏᴀꜱᴛ", [
        `◦ Target: *${nama}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-roast <nama> untuk roast lagi`);
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
