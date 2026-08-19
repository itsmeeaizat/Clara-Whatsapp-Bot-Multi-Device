// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDatabase } from "../../src/lib/clara-database.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { DEFAULT_PROVIDERS } from "../../src/lib/clara-ai-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginConfig = {
  name: "ai-addprovider",
  alias: ["ai-addprovider", "addprovider", "addai", "tambahprovider", "newai"],
  category: "ai",
  description: "Tambah provider AI custom lewat chat",
  usage: ".ai-addprovider <nama> <endpoint> <model> <apiKey?>",
  example: ".ai-addprovider myai https://example.com/chat gpt-4o-mini sk-xxx",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function getCustomProviders() {
  try {
    const db = getDatabase();
    const data = db.get("aiCustomProviders");
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function setCustomProviders(providers) {
  try {
    const db = getDatabase();
    db.set("aiCustomProviders", providers);
  } catch {}
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = (m.text || "").trim();
    const parts = raw.split(/[ \t]+/).filter(Boolean);
    const action = (parts[1] || "").toLowerCase();

    if (!action || action === "list" || action === "daftar") {
      const custom = getCustomProviders();
      const builtinLines = Object.entries(DEFAULT_PROVIDERS).map(([key, provider]) => {
        const models = (provider.models || []).slice(0, 3).join(", ");
        return `• ${provider.name} (${key})\n  Model: ${models}\n  Default: ${provider.defaultModel}`;
      });

      const customLines = Object.keys(custom).length
        ? Object.entries(custom).map(([key, provider]) => {
            const models = Array.isArray(provider.models) ? provider.models.slice(0, 3).join(", ") : provider.model || "-";
            return `• ${provider.name || key} (${key})\n  Model: ${models}\n  Default: ${provider.defaultModel || provider.model || "-"}`;
          })
        : ["• (belum ada provider custom)"];

      const text =
        alyaHeader("AI Providers", "🤖") +
        "\n\n" +
        bracketBox("🤖", "ʙᴀᴡᴀᴀɴ", builtinLines) +
        "\n\n" +
        bracketBox("➕", "ᴄᴜꜱᴛᴏᴍ", customLines) +
        "\n\n" +
        bracketBox("📋", "ᴘᴀᴋᴀɪ", [
          `◦ *${prefix}ai-addprovider list* — lihat semua provider`,
          `◦ *${prefix}ai-addprovider <nama> <endpoint> <model> [apiKey]* — tambah provider`,
          `◦ Contoh: *${prefix}ai-addprovider myai https://example.com/chat gpt-4o-mini sk-xxx*`,
          `◦ Untuk hapus: *${prefix}ai-addprovider delete <nama>*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "delete" || action === "del" || action === "remove") {
      const key = String(parts[2] || "").trim().toLowerCase();
      if (!key) {
        const text =
          alyaHeader("Hapus Provider", "🗑️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ Nama provider tidak boleh kosong.`,
            `◦ Contoh: *${prefix}ai-addprovider delete myai*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      const custom = getCustomProviders();
      if (!custom[key]) {
        const text =
          alyaHeader("Tidak Ditemukan", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴇʀʀᴏʀ", [
            `◦ Provider *${key}* tidak ditemukan.`,
            `◦ Ketik *${prefix}ai-addprovider list* untuk lihat daftar.`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      delete custom[key];
      setCustomProviders(custom);

      const text =
        alyaHeader("AI Providers", "🗑️") +
        "\n\n" +
        bracketBox("🗑️", "ʜᴀᴘᴜꜱ", [
          `◦ Provider *${key}* sudah dihapus.`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}ai-addprovider list untuk cek sisa provider`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    const name = String(action).trim();
    const endpoint = String(parts[2] || "").trim();
    const model = String(parts[3] || "").trim();
    const apiKey = String(parts[4] || "").trim();

    if (!name || !endpoint || !model) {
      const text =
        alyaHeader("Cara Pakai", "➕") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-addprovider <nama> <endpoint> <model> [apiKey]*`,
          `◦ Contoh: *${prefix}ai-addprovider myai https://example.com/chat gpt-4o-mini sk-xxx*`,
          `◦ Lihat daftar: *${prefix}ai-addprovider list*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const custom = getCustomProviders();
    custom[name.toLowerCase()] = {
      name: name,
      endpoint,
      model,
      apiKey,
      defaultModel: model,
      models: [model],
      supportsVision: false,
      supportsSystem: true,
    };
    setCustomProviders(custom);

    const text =
      alyaHeader("AI Providers", "➕") +
      "\n\n" +
      bracketBox("➕", "ʙᴀʀᴜ", [
        `◦ Nama: *${name}*`,
        `◦ Endpoint: *${endpoint}*`,
        `◦ Model: *${model}*`,
        `◦ API Key: *${apiKey ? "Tersimpan" : "Kosong"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}multi-ai ${name} <pesan> untuk mencoba`) +
      "\n" +
      tipText(`Ketik ${prefix}ai-addprovider list untuk lihat semua provider`) +
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
