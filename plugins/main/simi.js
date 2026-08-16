import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "simi",
  alias: ["simi", "simsimi", "chatbot", "simitalk"],
  category: "ai",
  description: "Chat dengan AI",
  usage: ".simi <pesan>",
  example: ".simi Halo, apa kabar?",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function callSimi(text, aiConfig) {
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
        { role: "system", content: systemPrompt || "Kamu adalah Simi, chatbot friendly." },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "Tidak ada respon dari AI.";
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const text = m.text?.trim();

    if (!text) {
      const out =
        alyaHeader("Cara Pakai", "🤖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}simi <pesan>*`,
          `◦ Contoh: *${prefix}simi Halo, apa kabar?*`,
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

    const reply = await callSimi(text, botConfig.aiHelp);

    const out =
      alyaHeader("Simi AI", "🤖") +
      "\n\n" +
      bracketBox("🤖", "ᴄʜᴀᴛ", [
        `◦ Kamu: *${text}*`,
        `◦ Simi: *${reply}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}simi <pesan> untuk chat lagi`) +
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
