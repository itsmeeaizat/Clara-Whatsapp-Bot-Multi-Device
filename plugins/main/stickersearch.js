// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "stickersearch",
  alias: ["stickersearch", "stcsearch", "stsearch", "caristiker"],
  category: "sticker",
  description: "Cari sticker dari Pinterest",
  usage: ".stickersearch <query>",
  example: ".stickersearch patung kuda",
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
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Cara Pakai", "🔎") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}stickersearch <query>*`,
          `◦ Contoh: *${prefix}stickersearch patung kuda*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { pinterest } = await import("btch-downloader");
    const data = await pinterest(`${query} sticker`);

    if (!data?.status) throw new Error("Gagal mencari sticker");

    const images = Array.isArray(data) ? data : [data];
    const selected = images.filter(i => i?.url || i?.image).slice(0, 5);

    for (const item of selected) {
      const imageUrl = item.url || item.image || item;
      if (typeof imageUrl !== "string") continue;

      try {
        const res = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
        await sock.sendMessage(m.chat, {
          sticker: Buffer.from(res.data),
        }, { quoted: m });
      } catch {}
    }

    const text =
      alyaHeader("Sticker Search", "🔎") +
      "\n\n" +
      bracketBox("🔎", "ʜᴀꜱɪʟ", [
        `◦ Query: *${query}*`,
        `◦ Total: *${selected.length} sticker*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}stickersearch <query> untuk cari lagi`);

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
