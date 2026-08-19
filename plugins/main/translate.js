// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "translate",
  alias: ["translate", "terjemah", "tl", "trans"],
  category: "tools",
  description: "Terjemahkan teks ke bahasa lain",
  usage: ".translate <bahasa> <teks>",
  example: ".translate en Halo, apa kabar?",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = m.text?.trim().split(/\s+/);
    const lang = args?.[0];
    const text = args?.slice(1).join(" ");

    if (!lang || !text) {
      const text =
        alyaHeader("Cara Pakai", "🌐") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}translate <bahasa> <teks>*`,
          `◦ Contoh: *${prefix}translate en Halo*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    let translated = text;
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const json = await res.json();
      translated = json?.[0]?.map((s) => s?.[0]).join("") || text;
    } catch {}

    const replyText =
      alyaHeader("Translate", "🌐") +
      "\n\n" +
      bracketBox("🌐", "ʜᴀꜱɪʟ", [
        "◦ Dari: *id*",
        `◦ Ke: *${lang}*`,
        `◦ Teks Asli: *${text}*`,
        `◦ Hasil: *${translated}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}translate <bahasa> <teks> untuk menerjemahkan lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    await m.reply(replyText);
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
