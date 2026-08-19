// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "pinterest",
  alias: ["pinterest", "pin", "pins", "image"],
  category: "search",
  description: "Cari gambar dari Pinterest",
  usage: ".pinterest <query>",
  example: ".pinterest anime",
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
        alyaHeader("Cara Pakai", "📌") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}pinterest <query>*`,
          `◦ Contoh: *${prefix}pinterest anime*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const { pinterest } = await import("btch-downloader");
    const data = await pinterest(query);

    if (!data?.status) throw new Error("Pinterest API returned no data");

    const images = Array.isArray(data) ? data : [data];
    const selected = images.slice(0, 5);

    for (const item of selected) {
      const imageUrl = item.url || item.image || item;
      if (typeof imageUrl !== "string") continue;

      try {
        const axios = (await import("axios")).default;
        const res = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
        await sock.sendMessage(m.chat, {
          image: Buffer.from(res.data),
          caption: `📌 *Pinterest*\n◦ Query: *${query}*`,
        }, { quoted: m });
      } catch {}
    }

    const text =
      alyaHeader("Pinterest", "📌") +
      "\n\n" +
      bracketBox("📌", "ʜᴀꜱɪʟ", [
        `◦ Query: *${query}*`,
        `◦ Total: *${selected.length} gambar*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}pinterest <query> untuk cari lagi`);

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
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
