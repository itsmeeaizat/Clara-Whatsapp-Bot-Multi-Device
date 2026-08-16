import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "readmore",
  alias: ["readmore", "readmore", "expand", "lengkap"],
  category: "tools",
  description: "Buat teks read more / expandable",
  usage: ".readmore <teks singkat> | <teks panjang>",
  example: ".readmore Klik lanjut | Ini isinya...",
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
    const raw = m.text?.trim() || "";

    if (!raw.includes("|")) {
      const text =
        alyaHeader("Cara Pakai", "📖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}readmore <singkat> | <panjang>*`,
          `◦ Contoh: *${prefix}readmore Lanjut... | Isi panjangnya*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const [shortText, longText] = raw.split("|").map((s) => s.trim());
    const body = `${shortText}\n\n▸ Read more:\n${longText}`;

    await m.reply(body);

    const text =
      alyaHeader("Read More", "📖") +
      "\n\n" +
      bracketBox("📖", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Singkat: *${shortText}*`,
        `◦ Panjang: *${longText.slice(0, 50)}${longText.length > 50 ? "..." : ""}*`,
        "◦ Status: *SUCCESS*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

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
