import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "ai-avatar",
  alias: ["ai-avatar", "aiavatar", "avatarai"],
  category: "ai",
  description: "Generate AI avatar dari teks",
  usage: ".ai-avatar <deskripsi>",
  example: ".ai-avatar cyberpunk warrior portrait",
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
        alyaHeader("Cara Pakai", "🤖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ai-avatar <deskripsi>*`,
          `◦ Contoh: *${prefix}ai-avatar cyberpunk warrior*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { fluxImage } = await import("../../src/scraper/seaart.js");
    const result = await fluxImage(`avatar portrait of ${prompt}, high quality, detailed`);

    if (!result?.url) throw new Error("Gagal generate avatar");

    const res = await axios.get(result.url, { responseType: "arraybuffer", timeout: 30000 });
    await sock.sendMessage(m.chat, {
      image: Buffer.from(res.data),
      caption: `🤖 *AI Avatar*\n◦ Prompt: *${prompt}*\n◦ Engine: *Flux AI*`,
    }, { quoted: m });

    const text =
      alyaHeader("AI Avatar", "🤖") +
      "\n\n" +
      bracketBox("🤖", "ʀᴇꜱᴜʟᴛ", [
        `◦ Prompt: *${prompt}*`,
        "◦ Engine: *Flux AI*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ai-avatar <deskripsi> untuk avatar lain`);

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
