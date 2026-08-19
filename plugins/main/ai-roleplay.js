// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAITask, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-helper.js";

const CHARACTERS = {
  "detektif": "Kamu adalah detektif jenius seperti Sherlock Holmes. Bicara dengan gaya analitis dan misterius.",
  "chef": "Kamu adalah chef terkenal. Bicara dengan semangat tentang masakan dan beri tips masak.",
  "dokter": "Kamu adalah dokter ramah. Beri advice kesehatan dengan bahasa yang mudah dipahami.",
  "psikolog": "Kamu adalah psikolog yang empatik. Dengarkan dan beri saran dengan bijak.",
  "motivator": "Kamu adalah motivator bersemangat. Beri semangat dan motivasi yang membara.",
  "naruto": "Kamu adalah Naruto Uzumaki. Bicara dengan semangat, suka ramen, dan bilang 'dattebayo!'.",
  "guru": "Kamu adalah guru sabar. Jelaskan dengan cara yang mudah dipahami dan beri contoh.",
};

const pluginConfig = {
  name: "ai-roleplay",
  alias: ["ai-roleplay", "roleplay", "rpai", "peran"],
  category: "ai",
  description: "Chat dengan AI peran karakter (multi-model)",
  usage: ".ai-roleplay [provider] <karakter> <pesan>",
  example: ".ai-roleplay detektif siapa pembunuhnya",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/\s+/);
    let providerArg = null;
    let remaining = m.text?.trim();

    if (args[0] && DEFAULT_PROVIDERS[args[0].toLowerCase()]) {
      providerArg = args[0].toLowerCase();
      args.shift();
      remaining = args.join(" ").trim();
    }

    const charKey = (args[0] || "").toLowerCase();
    const message = args.slice(1).join(" ").trim();

    if (!charKey || !message) {
      const charList = Object.entries(CHARACTERS).map(([k, _]) => `◦ *${k}*`).join("\n");
      const text = alyaHeader("Cara Pakai", "🎭") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-roleplay <karakter> <pesan>*`,
          `◦ Multi-model: *${prefix}ai-roleplay gemini <karakter> <pesan>*`,
        ]) + "\n\n" + "*Karakter tersedia:*\n" + charList +
        "\n\n" + separator() + "\n" +
        tipText(`Contoh: ${prefix}ai-roleplay detektif siapa pembunuhnya`);
      await m.reply(text);
      return { handled: true };
    }

    const systemPrompt = CHARACTERS[charKey] || `Kamu adalah karakter "${charKey}". Berperan dengan baik.`;

    const reply = await callAITask({
      prompt: message,
      systemPrompt,
      botConfig,
      providerArg,
    });

    const text = alyaHeader("AI Roleplay", "🎭") + "\n\n" +
      bracketBox("🎭", `ʀᴏʟᴇᴘʟᴀʏ: ${charKey}`, [
        providerArg ? `◦ Model: *${providerArg}*` : "◦ Model: *default*",
      ]) + "\n\n" + reply + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ai-roleplay <karakter> <pesan> untuk lanjut`);
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
