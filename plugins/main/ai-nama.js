import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const pluginConfig = {
  name: "ai-nama",
  alias: ["ai-nama", "namaai", "namagen", "bikinnama", "nicknamme"],
  category: "ai",
  description: "Generate nama kreatif dengan AI (multi-model)",
  usage: ".ai-nama [provider] <jenis>",
  example: ".ai-nama brand kopi | .ai-nama gemini nama game",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/\s+/);
    let providerArg = null;
    let jenis = m.text?.trim();

    if (args[0] && DEFAULT_PROVIDERS[args[0].toLowerCase()]) {
      providerArg = args[0].toLowerCase();
      jenis = args.slice(1).join(" ").trim();
    }

    if (!jenis) {
      const text = alyaHeader("Cara Pakai", "🏷️") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-nama <jenis>*`,
          `◦ Multi-model: *${prefix}ai-nama gemini <jenis>*`,
          `◦ Contoh: *${prefix}ai-nama brand kopi*`,
          `◦ Contoh: *${prefix}ai-nama nama game ML*`,
        ]) + "\n\n" + separator() + "\n" +
        tipText(`Provider: openai, gemini, groq, anthropic, mistral, deepseek`);
      await m.reply(text);
      return { handled: true };
    }

    const reply = await callAITask({
      prompt: `Buatkan 10 nama kreatif untuk: "${jenis}". Berikan variasi yang unik, mudah diingat, dan menarik. Sertakan penjelasan singkat tiap nama.`,
      systemPrompt: "Kamu adalah branding expert yang jago bikin nama kreatif, catchy, dan bermakna.",
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Nama", "🏷️") + "\n\n" +
      bracketBox("🏷️", "ɴᴀᴍᴀ ᴋʀᴇᴀᴛɪꜰ", [
        `◦ Jenis: *${jenis}*`,
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-nama <jenis> untuk nama lain`);
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
