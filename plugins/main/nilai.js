import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "nilai",
  alias: ["nilai", "grade", "score", "raport"],
  category: "info",
  description: "Cek nilai/rapor",
  usage: ".nilai <nama>",
  example: ".nilai Ahmad",
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
    const name = raw.replace(/^\.nilai\s+/i, "").trim() || "Kamu";

    const text =
      alyaHeader("Nilai", "📝") +
      "\n\n" +
      bracketBox("📝", "ʀᴀᴘᴏʀ", [
        `◦ Nama: *${name}*`,
        "◦ Nilai: *Belum tersedia*",
        "◦ Note: Fitur ini akan terhubung ke data nilai jika tersedia.",
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
