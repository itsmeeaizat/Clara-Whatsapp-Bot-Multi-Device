import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "simi2",
  alias: ["simi2", "simsimi2", "chat2", "simitalk2"],
  category: "ai",
  description: "Chat alternatif dengan AI",
  usage: ".simi2 <pesan>",
  example: ".simi2 Halo!",
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
    const text = m.text?.trim();

    if (!text) {
      const out =
        alyaHeader("Cara Pakai", "🤖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}simi2 <pesan>*`,
          `◦ Contoh: *${prefix}simi2 Halo!*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}aihelp untuk menu AI`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(out);
      return { handled: true };
    }

    const aiConfig = botConfig.aiHelp || {};
    const reply =
      aiConfig.apiKey && aiConfig.apiEndpoint && aiConfig.model
        ? `AI siap menerima pesan: *${text}*`
        : "AI belum dikonfigurasi. Minta owner mengisi API key dan endpoint di config.";

    const out =
      alyaHeader("Simi 2", "🤖") +
      "\n\n" +
      bracketBox("🤖", "ᴄʜᴀᴛ", [
        `◦ Kamu: *${text}*`,
        `◦ Simi2: *${reply}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}simi2 <pesan> untuk chat lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(out);
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
