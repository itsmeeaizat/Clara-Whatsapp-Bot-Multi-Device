// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "mamfes",
  alias: ["mamfes", "meme", "viral", "trend", "tiktok", "socmed", "ff"],
  category: "fun",
  description: "Kutipan/meme viral gaya TikTok ala org sling",
  usage: ".mamfes <teks>",
  example: ".mamfes Gue cuma butuh ketenangan",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 8,
  energi: 0,
  isEnabled: true,
};

const vibes = [
  { emoji: "😭", label: "Galau" },
  { emoji: "🔥", label: "Savage" },
  { emoji: "🤡", label: "Kocak" },
  { emoji: "💀", label: "Relate" },
  { emoji: "🥶", label: "Cold" },
  { emoji: "🗿", label: "Diam" },
  { emoji: "🤣", label: "Ngakak" },
  { emoji: "🫠", label: "Layover" },
];

const outro = [
  "Tiap like = dapet bravour",
  "Comment 'TAKBIZ' kalo relate",
  "Share ke story buat nembak ekspresi",
  "Ini fed meet timeline lu nanti",
  "Reels in making...",
];

function randomVibe() {
  return vibes[Math.floor(Math.random() * vibes.length)];
}

function randomOutro() {
  return outro[Math.floor(Math.random() * outro.length)];
}

function buildVibeLine(text, vibe) {
  return (
    `┏ ${vibe.emoji} *${vibe.label}*\n` +
    `┃ ${text}\n` +
    `┗ ${randomOutro()}`
  );
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const text = (m.text?.trim() ?? "").replace(/^\.mamfes\s+/i, "").trim();

    if (!text) {
      const menu =
        alyaHeader("Mamfes", "📈") +
        "\n\n" +
        bracketBox("📈", "ᴛʀᴇɴᴅɪɴɢ", [
          "◦ Fitur: *Mamfes Viral*",
          "◦ Mood: *TikTok/sling*",
          "◦ Usage: kirim teks, dapat meme vibe",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        bracketBox("🎭", "ᴠɪʙᴇꜱ", [
          "😭 Galau",
          "🔥 Savage",
          "🤡 Kocak",
          "💀 Relate",
          "🥶 Cold",
          "🗿 Diam",
          "🤣 Ngakak",
          "🫠 Layover",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Contoh: ${prefix}mamfes Gue butuh ketenangan`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(menu);
      return { handled: true };
    }

    const vibe = randomVibe();
    const content = buildVibeLine(text, vibe);
    const reply =
      alyaHeader("Mamfes", "📈") +
      "\n\n" +
      content +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Kirim ${prefix}mamfes untuk viral lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(reply);
  } catch (error) {
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
