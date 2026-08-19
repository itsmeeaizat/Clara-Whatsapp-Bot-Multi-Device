// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "owner",
  alias: ["owner", "creator", "author", "dev"],
  category: "owner",
  description: "Lihat info owner bot",
  usage: ".owner",
  example: ".owner",
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
    const owner = botConfig?.owner || {};
    const ownerName = owner.name || "Owner";
    const ownerNumber = owner.number || "";
    const ownerWa = ownerNumber ? `https://wa.me/${ownerNumber.replace(/[^0-9]/g, "")}` : "";

    const lines = [
      `◦ Nama: *${ownerName}*`,
      ownerNumber ? `◦ Nomor: *${ownerNumber}*` : "",
      ownerWa ? `◦ WA: *${ownerWa}*` : "",
    ].filter(Boolean);

    const text =
      alyaHeader("Owner", "👑") +
      "\n\n" +
      bracketBox("👑", "ᴏᴡɴᴇʀ", lines) +
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
