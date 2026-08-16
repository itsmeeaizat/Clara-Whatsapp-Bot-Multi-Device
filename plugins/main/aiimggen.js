import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "aiimggen",
  alias: ["aiimggen", "ai-gen", "aigen"],
  category: "ai",
  description: "Generate gambar AI dari teks",
  usage: ".aiimggen <deskripsi>",
  example: ".aiimggen a dragon flying",
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
        alyaHeader("Cara Pakai", "✨") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}aiimggen <deskripsi>*`,
          `◦ Contoh: *${prefix}aiimggen a dragon flying*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { fluxImage } = await import("../../src/scraper/seaart.js");
    const result = await fluxImage(prompt);

    if (!result?.url) throw new Error("Gagal generate gambar");

    const res = await axios.get(result.url, { responseType: "arraybuffer", timeout: 30000 });
    await sock.sendMessage(m.chat, {
      image: Buffer.from(res.data),
      caption: `✨ *AI Image Gen*\n◦ Prompt: *${prompt}*\n◦ Engine: *Flux AI*`,
    }, { quoted: m });

    const text =
      alyaHeader("AI Image Gen", "✨") +
      "\n\n" +
      bracketBox("✨", "ʀᴇꜱᴜʟᴛ", [
        `◦ Prompt: *${prompt}*`,
        "◦ Engine: *Flux AI*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}aiimggen <deskripsi> untuk gambar lain`);

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
