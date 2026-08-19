// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-hashtag",
  alias: ["ai-hashtag", "hashtagai", "hashtag", "tagarai"],
  category: "ai",
  description: "Generate hashtag social media dengan AI (multi-model)",
  usage: ".ai-hashtag [provider] <tema>",
  example: ".ai-hashtag makanan | .ai-hashtag gemini travel",
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
      const text = alyaHeader("Cara Pakai", "#️⃣") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-hashtag <tema>*`,
          `◦ Multi-model: *${prefix}ai-hashtag gemini <tema>*`,
          `◦ Contoh: *${prefix}ai-hashtag makanan*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Buatkan 20 hashtag untuk tema "${tema}" yang cocok untuk Instagram/TikTok. Kombinasi hashtag populer dan niche. Format: #hashtag1 #hashtag2 dst.`,
      systemPrompt: "Kamu adalah social media expert. Buat hashtag yang relevan, trending, dan punya campuran popular dan niche.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Hashtag", "#️⃣") + "\n\n" +
      bracketBox("#️⃣", "ʜᴀꜱʜᴛᴀɢ", [
        `◦ Tema: *${tema}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-hashtag <tema> untuk hashtag lain`);
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
