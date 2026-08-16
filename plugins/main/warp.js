import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "warp",
  alias: ["warp", "warpaint"],
  category: "maker",
  description: "Generate gambar dari teks (AI Warp)",
  usage: ".warp <deskripsi>",
  example: ".warp futuristic city at night",
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
        alyaHeader("Cara Pakai", "🌀") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}warp <deskripsi>*`,
          `◦ Contoh: *${prefix}warp futuristic city*`,
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
      caption: `🌀 *Warp AI*\n◦ Prompt: *${prompt}*`,
    }, { quoted: m });

    const info =
      alyaHeader("Warp", "🌀") +
      "\n\n" +
      bracketBox("🌀", "ʀᴇꜱᴜʟᴛ", [
        `◦ Prompt: *${prompt}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}warp <deskripsi> untuk gambar lain`);

    await m.reply(info);
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
