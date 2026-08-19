// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { callAI, DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDatabase() {
  const { getDatabase: getDb } = require("../../src/lib/clara-database.js");
  return getDb();
}

function getCustomProviders() {
  try {
    const db = getDatabase();
    const data = db.get("aiCustomProviders");
    if (data && typeof data === "object") return data;
  } catch {}
  return {};
}

function getAllProviders() {
  const custom = getCustomProviders();
  return { ...DEFAULT_PROVIDERS, ...custom };
}

function resolveModel(providerKey, modelArg) {
  const providers = getAllProviders();
  const provider = providers[providerKey];
  if (!provider) return null;
  const models = Array.isArray(provider.models) ? provider.models : [];
  const model = modelArg && models.includes(modelArg) ? modelArg : provider.defaultModel || provider.model || modelArg;
  return { provider, model };
}

const pluginConfig = {
  name: "multi-ai",
  alias: ["multi-ai", "ma", "aichat", "askai", "tanyaai"],
  category: "ai",
  description: "Chat dengan berbagai AI (OpenAI, Gemini, Claude, Groq, Together, Blackbox, Mistral, DeepSeek, GitHub Models, Llama + custom)",
  usage: ".multi-ai <provider> <pesan> | .multi-ai list",
  example: ".multi-ai gemini Jelaskankan quantum computing",
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
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const providerArg = (args[0] || "").toLowerCase();
    const modelArg = (args[1] || "").trim();
    const message = args.slice(2).join(" ").trim();

    if (!providerArg || providerArg === "list" || providerArg === "daftar") {
      const providers = getAllProviders();
      const lines = Object.entries(providers).map(([key, provider]) => {
        const models = (provider.models || [provider.model || "-"]).map((model) => `• ${model}`).join("\n");
        return `${provider.name || key} (${key})\nDefault: ${provider.defaultModel || provider.model || "-"}\n${models}`;
      });

      const text =
        alyaHeader("Multi AI", "🤖") +
        "\n\n" +
        bracketBox("🤖", "ᴘʀᴏᴠɪᴅᴇʀ", [
          ...lines.flatMap((line, index) => [line, index < lines.length - 1 ? "" : null]).filter(Boolean),
        ]) +
        "\n\n" +
        bracketBox("📋", "ᴘᴀᴋᴀɪ", [
          `◦ Penggunaan: *${prefix}multi-ai <provider> [model] <pesan>*`,
          `◦ Contoh: *${prefix}multi-ai gemini Jelaskankan quantum computing*`,
          `◦ Contoh: *${prefix}multi-ai openai gpt-4o-mini Apa itu AI?*`,
          `◦ Tambah AI lain: *${prefix}ai-addprovider <nama> <endpoint> <model> [apiKey]*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (!message) {
      const text =
        alyaHeader("Cara Pakai", "🤖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}multi-ai <provider> [model] <pesan>*`,
          `◦ Contoh: *${prefix}multi-ai claude Jelaskankan AI*`,
          `◦ Ketik *${prefix}multi-ai list* untuk lihat daftar provider`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const resolved = resolveModel(providerArg, modelArg);
    if (!resolved) {
      const text =
        alyaHeader("Tidak Dikenal", "⚠️") +
        "\n\n" +
        bracketBox("⚠️", "ᴇʀʀᴏʀ", [
          `◦ Provider *${providerArg}* tidak dikenali.`,
          `◦ Lihat provider custom: *${prefix}ai-addprovider list*`,
          `◦ Ketik *${prefix}multi-ai list* untuk lihat daftar.`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { provider, model } = resolved;
    const aiConfig = botConfig.aiHelp || {};
    const apiKey = String(aiConfig.apiKey || "");
    const apiEndpoint = String(typeof provider.chatEndpoint === "function" ? provider.chatEndpoint(model || providerArg) : provider.chatEndpoint || aiConfig.apiEndpoint || "");
    const systemPrompt = String(aiConfig.systemPrompt || "Kamu adalah asisten AI yang membantu.");

    const reply = await callAI({
      providerKey: providerArg,
      model,
      messages: [{ role: "user", content: message }],
      systemPrompt,
      apiKey,
      apiEndpoint,
    });

    const text =
      alyaHeader("Multi AI", "🤖") +
      "\n\n" +
      bracketBox("🤖", provider.name.toUpperCase(), [
        `◦ Model: *${model}*`,
        `◦ Kamu: *${message.slice(0, 200)}${message.length > 200 ? "..." : ""}*`,
        `◦ AI: *${reply.slice(0, 1500)}${reply.length > 1500 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}multi-ai <provider> <pesan> untuk chat lagi`) +
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
