import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "donasi",
  alias: ["donasi", "donate", "donation", "dukung"],
  category: "info",
  description: "Lihat info donasi untuk owner",
  usage: ".donasi",
  example: ".donasi",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const donation = botConfig?.donation || {};
    const lines = [
      "◦ Dukungan sangat berarti!",
      donation.ownerName ? `◦ Owner: *${donation.ownerName}*` : "◦ Owner: *Lihat .owner*",
      donation.methods && donation.methods.length
        ? `◦ Metode: *${donation.methods.join(", ")}*`
        : "◦ Metode: *Hubungi owner*",
      donation.note ? `◦ Catatan: *${donation.note}*` : "",
    ].filter(Boolean);

    const text =
      alyaHeader("Donasi", "❤️") +
      "\n\n" +
      bracketBox("❤️", "ᴅᴜᴋᴜɴɢ", lines) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}owner untuk kontak owner`) +
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
