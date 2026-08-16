import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "ai-providers",
  alias: ["ai-providers", "providers", "daftarai", "listai", "allai"],
  category: "ai",
  description: "Lihat semua provider AI yang tersedia",
  usage: ".ai-providers",
  example: ".ai-providers",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const lines = Object.entries(DEFAULT_PROVIDERS).map(([key, provider]) => {
      const models = (provider.models || []).slice(0, 5).join(", ");
      const vision = provider.supportsVision ? "Ya" : "Tidak";
      return `• ${provider.name} (${key})\n  Model: ${models}\n  Vision: ${vision}\n  Default: ${provider.defaultModel}`;
    });

    const text =
      alyaHeader("AI Providers", "🤖") +
      "\n\n" +
      bracketBox("🤖", "ᴘʀᴏᴠɪᴅᴇʀ", lines) +
      "\n\n" +
      bracketBox("📋", "ᴘᴀᴋᴀɪ", [
        `◦ *${prefix}multi-ai <provider> <pesan>* — chat dengan provider tertentu`,
        `◦ *${prefix}ai-set provider <nama>* — ganti provider default`,
        `◦ *${prefix}ai-addprovider list* — lihat provider custom`,
        `◦ *${prefix}menu* — kembali ke menu utama`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        `◦ Status: *Gagal*`,
        `◦ Alasan: *${error.message}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
