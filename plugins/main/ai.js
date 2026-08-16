import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "ai",
  alias: ["gpt", "openai", "ask", "tanya", "chat"],
  category: "ai",
  description: "Tanya jawab dengan AI",
  usage: ".ai <pertanyaan>",
  example: ".ai cara membuat kue",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function callAI(prompt, aiConfig) {
  const { apiKey, apiEndpoint, model, systemPrompt } = aiConfig || {};

  if (!apiKey || !apiEndpoint || !model) {
    return "AI belum dikonfigurasi. Minta owner mengisi API key dan endpoint di config.";
  }

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt || "Kamu adalah asisten bot WhatsApp." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "Tidak ada respon dari AI.";
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const prompt = m.text?.trim();

    if (!prompt) {
      const text =
        alyaHeader("Cara Pakai", "🤖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai <pertanyaan>*`,
          `◦ Contoh: *${prefix}ai cara membuat kue*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const aiReply = await callAI(prompt, botConfig.aiHelp);

    const text =
      alyaHeader("AI Chat", "🤖") +
      "\n\n" +
      bracketBox("💬", "ᴘᴇʀᴛᴀɴʏᴀᴀɴ", [
        `◦ Kamu: *${prompt}*`,
      ]) +
      "\n\n" +
      bracketBox("🤖", "ᴊᴀᴡᴀʙᴀɴ", [
        `◦ AI: *${aiReply}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai <pertanyaan> untuk tanya lagi`) +
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
