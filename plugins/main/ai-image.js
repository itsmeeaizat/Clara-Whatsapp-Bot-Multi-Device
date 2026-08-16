import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "ai-image",
  alias: ["ai-image", "aiimage", "aiimg"],
  category: "ai",
  description: "Generate gambar AI dari teks (Flux)",
  usage: ".ai-image <deskripsi>",
  example: ".ai-image sunset over mountains",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const prompt = m.text?.trim();

    if (!prompt) {
      const text =
        alyaHeader("Cara Pakai", "🖼️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-image <deskripsi>*`,
          `◦ Contoh: *${prefix}ai-image sunset over mountains*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { Txt2Img2 } = await import("../../src/scraper/txt2img2.js");
    const result = await Txt2Img2(prompt);

    if (!result?.url) throw new Error("Gagal generate gambar");

    const res = await axios.get(result.url, { responseType: "arraybuffer", timeout: 30000 });
    await sock.sendMessage(m.chat, {
      image: Buffer.from(res.data),
      caption: `🖼️ *AI Image*\n◦ Prompt: *${prompt}*\n◦ Engine: *Flux 2*`,
    }, { quoted: m });

    const text =
      alyaHeader("AI Image", "🖼️") +
      "\n\n" +
      bracketBox("🖼️", "ʀᴇꜱᴜʟᴛ", [
        `◦ Prompt: *${prompt}*`,
        "◦ Engine: *Flux 2*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai-image <deskripsi> untuk gambar lain`);

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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
