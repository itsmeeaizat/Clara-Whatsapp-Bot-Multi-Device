import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { DEFAULT_PROVIDERS, resolveProvider } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "ai-set",
  alias: ["ai-set", "aiset2", "setai", "configai", "ai-config"],
  category: "ai",
  description: "Set pengaturan AI lewat chat (apiKey, endpoint, model, provider)",
  usage: ".ai-set <aksi> <nilai>",
  example: ".ai-set apiKey sk-xxx\n.ai-set provider gemini\n.ai-set model gpt-4o-mini\n.ai-set on",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function getAIHelpConfig(botConfig) {
  return (botConfig && botConfig.aiHelp) ? botConfig.aiHelp : {};
}

function buildProviderList(prefix) {
  const lines = Object.entries(DEFAULT_PROVIDERS).map(([key, provider]) => {
    const models = (provider.models || []).slice(0, 3).join(", ");
    return `• ${provider.name} (${key})\n  Model: ${models}\n  Default: ${provider.defaultModel}`;
  });

  return [
    `◦ Berikut daftar provider bawaan:`,
    "",
    ...lines,
    "",
    `◦ Kamu juga bisa tambah provider custom dengan *${prefix}ai-addprovider*`,
    `◦ Untuk pakai: *${prefix}multi-ai <provider> <pesan>*`,
  ];
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = (m.text || "").trim();
    const parts = raw.split(/[ \t]+/).filter(Boolean);
    const action = (parts[1] || "").toLowerCase();
    const value = parts.slice(2).join(" ").trim();

    const aiHelpConfig = getAIHelpConfig(botConfig);
    const enabled = aiHelpConfig.enabled !== false;
    const currentProvider = String(aiHelpConfig.provider || "openai");
    const currentModel = String(aiHelpConfig.model || "gpt-4o-mini");
    const currentEndpoint = String(aiHelpConfig.apiEndpoint || "https://api.openai.com/v1/chat/completions");

    if (!action || action === "list" || action === "daftar" || action === "status") {
      const maskedKey = aiHelpConfig.apiKey ? `${String(aiHelpConfig.apiKey).slice(0, 6)}...${String(aiHelpConfig.apiKey).slice(-4)}` : "Belum diisi";
      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ꜱᴛᴀᴛᴜꜱ", [
          `◦ Status AI: *${enabled ? "ON" : "OFF"}*`,
          `◦ Provider: *${currentProvider}*`,
          `◦ Model: *${currentModel}*`,
          `◦ Endpoint: *${currentEndpoint}*`,
          `◦ API Key: *${maskedKey}*`,
          `◦ System Prompt: *${String(aiHelpConfig.systemPrompt || "").slice(0, 80)}...*`,
        ]) +
        "\n\n" +
        bracketBox("📋", "ᴘʀᴏᴠɪᴅᴇʀ", buildProviderList(prefix)) +
        "\n\n" +
        bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
          `◦ *${prefix}ai-set list* — lihat pengaturan AI`,
          `◦ *${prefix}ai-set provider <nama>* — ganti provider`,
          `◦ *${prefix}ai-set model <model>* — ganti model`,
          `◦ *${prefix}ai-set apiKey <key>* — set API key`,
          `◦ *${prefix}ai-set endpoint <url>* — set endpoint`,
          `◦ *${prefix}ai-set prompt <teks>* — set system prompt`,
          `◦ *${prefix}ai-set on/off* — nyalakan/matikan AI`,
          `◦ *${prefix}ai-set mode offline/online* — ganti mode`,
          `◦ *${prefix}ai-addprovider* — tambah provider custom`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "provider") {
      const providerArg = String(value || "").toLowerCase();
      const provider = resolveProvider(providerArg, {});
      const customProvider = providerArg && !provider ? null : null;

      if (!provider) {
        const text =
          alyaHeader("Provider Tidak Valid", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ Provider *${value || ""}* tidak dikenali.`,
            `◦ Ketik *${prefix}ai-set list* untuk lihat provider bawaan.`,
            `◦ Atau tambah provider custom dengan *${prefix}ai-addprovider*.`,
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
      botConfig.aiHelp.model = provider.defaultModel;

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          `◦ Provider: *${providerArg}*`,
          `◦ Model: *${provider.defaultModel}*`,
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-set list untuk cek pengaturan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "model") {
      const modelArg = String(value || "").trim();
      if (!modelArg) {
        const text =
          alyaHeader("Model Kosong", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ Model tidak boleh kosong.`,
            `◦ Contoh: *${prefix}ai-set model gpt-4o-mini*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      if (!botConfig.aiHelp) botConfig.aiHelp = {};
      botConfig.aiHelp.model = modelArg;

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          `◦ Model: *${modelArg}*`,
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-set list untuk cek pengaturan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "apikey") {
      const apiKey = String(value || "").trim();
      if (!apiKey) {
        const text =
          alyaHeader("API Key Kosong", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ API key tidak boleh kosong.`,
            `◦ Contoh: *${prefix}ai-set apiKey sk-xxx*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      if (!botConfig.aiHelp) botConfig.aiHelp = {};
      botConfig.aiHelp.apiKey = apiKey;

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          "◦ API Key: *Disembunyikan*",
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-set list untuk cek pengaturan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "endpoint") {
      const endpoint = String(value || "").trim();
      if (!endpoint) {
        const text =
          alyaHeader("Endpoint Kosong", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ Endpoint tidak boleh kosong.`,
            `◦ Contoh: *${prefix}ai-set endpoint https://api.openai.com/v1/chat/completions*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      if (!botConfig.aiHelp) botConfig.aiHelp = {};
      botConfig.aiHelp.apiEndpoint = endpoint;

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          `◦ Endpoint: *${endpoint}*`,
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-set list untuk cek pengaturan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "prompt") {
      const prompt = String(value || "").trim();
      if (!prompt) {
        const text =
          alyaHeader("Prompt Kosong", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ System prompt tidak boleh kosong.`,
            `◦ Contoh: *${prefix}ai-set prompt Kamu adalah asisten yang membantu.*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      if (!botConfig.aiHelp) botConfig.aiHelp = {};
      botConfig.aiHelp.systemPrompt = prompt;

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          `◦ System Prompt: *${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}*`,
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-set list untuk cek pengaturan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "on" || action === "off") {
      if (!m.isOwner) {
        const text =
          alyaHeader("Ditolak", "⛔") +
          "\n\n" +
          bracketBox("⛔", "ᴇʀʀᴏʀ", [
            "◦ Status: *Ditolak*",
            "◦ Alasan: *Hanya owner yang bisa menyalakan/mematikan AI.*",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      if (!botConfig.aiHelp) botConfig.aiHelp = {};
      botConfig.aiHelp.enabled = action === "on";

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          `◦ Status: *${action === "on" ? "ON" : "OFF"}*`,
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-set list untuk cek pengaturan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "mode") {
      if (!m.isOwner) {
        const text =
          alyaHeader("Ditolak", "⛔") +
          "\n\n" +
          bracketBox("⛔", "ᴇʀʀᴏʀ", [
            "◦ Status: *Ditolak*",
            "◦ Alasan: *Hanya owner yang bisa mengganti mode AI.*",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      const newMode = String(value || "").toLowerCase();
      if (!["offline", "online"].includes(newMode)) {
        const text =
          alyaHeader("Mode Tidak Valid", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            "◦ Mode yang tersedia: *offline* atau *online*.",
            `◦ Contoh: *${prefix}ai-set mode online*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      if (!botConfig.aiHelp) botConfig.aiHelp = {};
      botConfig.aiHelp.mode = newMode;

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          `◦ Mode: *${newMode.toUpperCase()}*`,
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-set list untuk cek pengaturan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Tidak Dikenal", "⚠️") +
      "\n\n" +
      bracketBox("⚠️", "ᴇʀʀᴏʀ", [
        `◦ Aksi *${action}* tidak dikenali.`,
        `◦ Ketik *${prefix}ai-set list* untuk lihat opsi.`,
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
