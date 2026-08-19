// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-service.js";

const pluginConfig = {
  name: "aiset",
  alias: ["aiset", "aisetting", "setai", "aicfg"],
  category: "ai",
  description: "Kelola pengaturan AI dari dalam bot",
  usage: ".aiset list | .aiset provider <nama> | .aiset on/off",
  example: ".aiset provider gemini",
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
    `◦ Berikut daftar provider yang didukung:`,
    "",
    ...lines,
    "",
    `◦ Contoh pakai: *${prefix}multi-ai gemini Jelaskan quantum computing*`,
    `◦ Provider aktif sekarang diatur lewat config *aiHelp* di config.js.`,
  ];
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = (m.text || "").trim();
    const parts = raw.split(/[ \t]+/).filter(Boolean);
    const action = (parts[1] || "").toLowerCase();
    const value = (parts[2] || "").trim();

    const aiHelpConfig = getAIHelpConfig(botConfig);
    const enabled = aiHelpConfig.enabled !== false;
    const currentMode = String(aiHelpConfig.mode || "offline").toLowerCase();

    if (!action || action === "list" || action === "daftar") {
      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ꜱᴛᴀᴛᴜꜱ", [
          `◦ Status: *${enabled ? "ON" : "OFF"}*`,
          `◦ Mode: *${currentMode.toUpperCase()}*`,
          `◦ Provider: *${aiHelpConfig.provider || "openai"}*`,
          `◦ Model: *${aiHelpConfig.model || "gpt-4o-mini"}*`,
          `◦ Endpoint: *${aiHelpConfig.apiEndpoint || "https://api.openai.com/v1/chat/completions"}*`,
        ]) +
        "\n\n" +
        bracketBox("📋", "ᴘʀᴏᴠɪᴅᴇʀ", buildProviderList(prefix)) +
        "\n\n" +
        bracketBox("📋", "ᴘᴀᴋᴀɪ", [
          `◦ *${prefix}aiset list* — lihat pengaturan AI`,
          `◦ *${prefix}aiset provider <nama>* — lihat provider`,
          `◦ *${prefix}aiset on/off* — owner toggle AI Help`,
          `◦ *${prefix}aiset mode offline/online* — owner ganti mode`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "provider") {
      const key = String(value || "").toLowerCase();
      const provider = DEFAULT_PROVIDERS[key];
      if (!provider) {
        const text =
          alyaHeader("Tidak Dikenal", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ Provider *${value || ""}* tidak dikenali.`,
            `◦ Ketik *${prefix}aiset list* untuk lihat daftar.`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      const models = (provider.models || []).join(", ");
      const text =
        alyaHeader("Provider", "🤖") +
        "\n\n" +
        bracketBox("🤖", provider.name.toUpperCase(), [
          `◦ Key: *${key}*`,
          `◦ Default model: *${provider.defaultModel}*`,
          `◦ Models: *${models}*`,
          `◦ Supports vision: *${provider.supportsVision ? "Ya" : "Tidak"}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}aiset provider <nama> untuk cek provider lain`) +
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
            "◦ Alasan: *Hanya owner yang bisa menyalakan/mematikan AI Help.*",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      const newState = action === "on";
      if (!botConfig.aiHelp) botConfig.aiHelp = {};
      botConfig.aiHelp.enabled = newState;
      if (!botConfig.aiHelp.mode) botConfig.aiHelp.mode = "offline";

      const text =
        alyaHeader("AI Settings", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
          `◦ Status: *${newState ? "ON" : "OFF"}*`,
          `◦ Mode: *${String(botConfig.aiHelp.mode || "offline").toUpperCase()}*`,
          "◦ Perubahan akan berlaku setelah config reload.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}aiset list untuk cek pengaturan`) +
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
            "◦ Alasan: *Hanya owner yang bisa mengganti mode AI Help.*",
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
            `◦ Contoh: *${prefix}aiset mode online*`,
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
        tipText(`Ketik ${prefix}aiset list untuk cek pengaturan`) +
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
        `◦ Ketik *${prefix}aiset list* untuk lihat opsi.`,
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
