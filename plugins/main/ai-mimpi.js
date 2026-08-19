// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-mimpi",
  alias: ["ai-mimpi", "mimpiai", "artimimpi", "tafsirmimpi"],
  category: "ai",
  description: "Tafsir arti mimpi dengan AI (multi-model)",
  usage: ".ai-mimpi [provider] <isi mimpi>",
  example: ".ai-mimpi gigi copot | .ai-mimpi gemini melihat hantu",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/\s+/);
    let providerArg = null;
    let mimpi = m.text?.trim();

    if (args[0] && DEFAULT_PROVIDERS[args[0].toLowerCase()]) {
      providerArg = args[0].toLowerCase();
      mimpi = args.slice(1).join(" ").trim();
    }

    if (!mimpi) {
      const text = alyaHeader("Cara Pakai", "💭") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-mimpi <isi mimpi>*`,
          `◦ Multi-model: *${prefix}ai-mimpi gemini <mimpi>*`,
          `◦ Contoh: *${prefix}ai-mimpi gigi copot*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Tafsirkan mimpi tentang: "${mimpi}" dalam bahasa Indonesia. Berikan interpreasi dari sisi psikologis dan tradisi. Apakah pertanda baik atau tidak?`,
      systemPrompt: "Kamu adalah ahli tafsir mimpi yang bijak. Beri interpreasi yang平衡, tidak menakuti, tapi jujur.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Mimpi", "💭") + "\n\n" +
      bracketBox("💭", "ᴛᴀꜰꜱɪʀ ᴍɪᴍᴘɪ", [
        `◦ Mimpi: *${mimpi}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-mimpi <mimpi> untuk tafsir lain`);
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
