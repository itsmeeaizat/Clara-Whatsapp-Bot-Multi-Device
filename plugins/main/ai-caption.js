import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-caption",
  alias: ["ai-caption", "captionai", "caption", "igcaption"],
  category: "ai",
  description: "Buat caption social media dengan AI (multi-model)",
  usage: ".ai-caption [provider] <deskripsi>",
  example: ".ai-caption foto pantai | .ai-caption gemini foto makanan",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/\s+/);
    let providerArg = null;
    let desc = m.text?.trim();

    if (args[0] && DEFAULT_PROVIDERS[args[0].toLowerCase()]) {
      providerArg = args[0].toLowerCase();
      desc = args.slice(1).join(" ").trim();
    }

    if (!desc) {
      const text = alyaHeader("Cara Pakai", "📸") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-caption <deskripsi>*`,
          `◦ Multi-model: *${prefix}ai-caption gemini <deskripsi>*`,
          `◦ Contoh: *${prefix}ai-caption foto sunset di pantai*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Buatkan 3 caption Instagram menarik untuk: "${desc}". Caption harus catchy, ada emoji, dan engaging. Masing-masing caption gaya berbeda (lucu, estetik, inspiratif).`,
      systemPrompt: "Kamu adalah content creator Instagram yang jago bikin caption engaging. Buat caption dengan emoji yang pas dan call-to-action.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Caption", "📸") + "\n\n" +
      bracketBox("📸", "ᴄᴀᴘᴛɪᴏɴ", [
        `◦ Deskripsi: *${desc}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-caption <deskripsi> untuk caption lain`);
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
