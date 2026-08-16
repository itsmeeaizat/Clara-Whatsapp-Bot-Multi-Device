import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "epho",
  alias: ["epho", "ephoto"],
  category: "maker",
  description: "Generate ephoto dari teks",
  usage: ".epho <teks>",
  example: ".epho Clara",
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
    const text = m.text?.trim();

    if (!text) {
      const reply =
        alyaHeader("Cara Pakai", "📝") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}ephoto <teks>*`,
          `◦ Contoh: *${prefix}ephoto Clara*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    // Use AI image generation as ephoto replacement
    const { fluxImage } = await import("../../src/scraper/seaart.js");
    const result = await fluxImage(`elegant text typography design with text "${text}", professional, high quality, golden letters on dark background`);

    if (!result?.url) throw new Error("Gagal generate ephoto");

    const res = await axios.get(result.url, { responseType: "arraybuffer", timeout: 30000 });
    await sock.sendMessage(m.chat, {
      image: Buffer.from(res.data),
      caption: `📝 *Ephoto*\n◦ Teks: *${text}*\n◦ Engine: *AI Flux*`,
    }, { quoted: m });

    const info =
      alyaHeader("Ephoto", "📝") +
      "\n\n" +
      bracketBox("📝", "ʀᴇꜱᴜʟᴛ", [
        `◦ Teks: *${text}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}ephoto <teks> untuk ephoto lain`);

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
