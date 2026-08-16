import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "kbbi",
  alias: ["kbbi", "kamus", "arti", "dictionary"],
  category: "tools",
  description: "Cek arti kata di KBBI",
  usage: ".kbbi <kata>",
  example: ".kbbi mobil",
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
    const word = m.text?.trim();

    if (!word) {
      const text =
        alyaHeader("Cara Pakai", "📚") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}kbbi <kata>*`,
          `◦ Contoh: *${prefix}kbbi mobil*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    let meaning = "-";
    try {
      const res = await fetch(`https://api.dicode.xyz/api/kbbi?kata=${encodeURIComponent(word)}`);
      const json = await res.json();
      meaning = json.meaning || json.arti || meaning;
    } catch {}

    const text =
      alyaHeader("KBBI", "📚") +
      "\n\n" +
      bracketBox("📚", "ʜᴀꜱɪʟ", [
        `◦ Kata: *${word}*`,
        `◦ Arti: *${meaning}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}kbbi <kata> untuk cek arti lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    await m.reply(text);
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
