import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { DEFAULT_PROVIDERS, resolveProvider } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "aichat-model",
  alias: ["aichat-model", "aichatmodel", "modelai", "aimodel", "switchmodel"],
  category: "ai",
  description: "Cek atau ganti model AI untuk chat",
  usage: ".aichat-model list | .aichat-model <provider> <model>",
  example: ".aichat-model gemini gemini-1.5-pro",
  isOwner: true,
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
    const raw = (m.text || "").trim();
    const parts = raw.split(/[ \t]+/).filter(Boolean);
    const providerArg = (parts[1] || "").toLowerCase();
    const modelArg = (parts[2] || "").trim();

    if (!providerArg || providerArg === "list" || providerArg === "daftar") {
      const lines = Object.entries(DEFAULT_PROVIDERS).map(([key, provider]) => {
        const models = (provider.models || []).map((model) => `• ${model}`).join("\n");
        return `${provider.name} (${key})\nDefault: ${provider.defaultModel}\n${models}`;
      });

      const text =
        alyaHeader("AI Model", "🤖") +
        "\n\n" +
        bracketBox("🤖", "ᴍᴏᴅᴇʟ", [
          ...lines.flatMap((line, index) => [line, index < lines.length - 1 ? "" : null]).filter(Boolean),
        ]) +
        "\n\n" +
        bracketBox("📋", "ᴘᴀᴋᴀɪ", [
          `◦ *${prefix}aichat-model list* — lihat daftar model`,
          `◦ *${prefix}aichat-model <provider> <model>* — ganti model aktif`,
          `◦ Contoh: *${prefix}aichat-model gemini gemini-1.5-pro*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const provider = resolveProvider(providerArg, {});
    if (!provider) {
      const text =
        alyaHeader("Tidak Dikenal", "⚠️") +
        "\n\n" +
        bracketBox("⚠️", "ᴇʀʀᴏʀ", [
          `◦ Provider *${providerArg}* tidak dikenali.`,
          `◦ Ketik *${prefix}aichat-model list* untuk lihat daftar.`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (!modelArg || !(provider.models || []).includes(modelArg)) {
      const text =
        alyaHeader("Model Tidak Valid", "⚠️") +
        "\n\n" +
        bracketBox("⚠️", "ᴇʀʀᴏʀ", [
          `◦ Model *${modelArg || ""}* tidak tersedia untuk provider *${providerArg}*.`,
          `◦ Model tersedia: *${(provider.models || []).join(", ")}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}aichat-model list untuk lihat daftar`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    if (!m.isOwner) {
      const text =
        alyaHeader("Ditolak", "⛔") +
        "\n\n" +
        bracketBox("⛔", "ᴇʀʀᴏʀ", [
          "◦ Status: *Ditolak*",
          "◦ Alasan: *Hanya owner yang bisa mengganti model AI.*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (!botConfig.aiHelp) botConfig.aiHelp = {};
    botConfig.aiHelp.provider = providerArg;
    botConfig.aiHelp.model = modelArg;

    const text =
      alyaHeader("AI Model", "🤖") +
      "\n\n" +
      bracketBox("🤖", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
        `◦ Provider: *${providerArg}*`,
        `◦ Model: *${modelArg}*`,
        "◦ Perubahan akan berlaku setelah config reload.",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
