import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "rewrite",
  alias: ["rewrite", "parafrase", "perbaiki", "edittext", "susunulang"],
  category: "ai",
  description: "Tulis ulang teks agar lebih natural",
  usage: ".rewrite <teks> | reply teks",
  example: ".rewrite <teks>",
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
    const raw = m.text?.trim() || "";
    const text = m.quoted?.text ? m.quoted.text : raw.replace(/^\.rewrite\s+/i, "").trim();

    if (!text) {
      const out =
        alyaHeader("Cara Pakai", "✍️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}rewrite <teks>*`,
          `◦ Atau reply pesan dengan *${prefix}rewrite*`,
          `◦ Contoh: *${prefix}rewrite pesan ini*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(out);
      return { handled: true };
    }

    const prompt = `Tulis ulang teks berikut menjadi lebih jelas, natural, dan enak dibaca dalam bahasa Indonesia tanpa mengubah makna:\n\n${text.slice(0, 4000)}`;
    const reply = await callAI(prompt, botConfig.aiHelp);

    const out =
      alyaHeader("Rewrite", "✍️") +
      "\n\n" +
      bracketBox("✍️", "ʜᴀꜱɪʟ", [
        `◦ Teks: *${text.slice(0, 200)}${text.length > 200 ? "..." : ""}*`,
        `◦ Hasil: *${reply}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}rewrite <teks> untuk tulis ulang lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
