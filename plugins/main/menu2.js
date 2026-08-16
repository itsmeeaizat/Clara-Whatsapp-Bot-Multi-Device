import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const COMMANDS = [
  { cmd: ".anime", desc: "Cari gambar anime" },
  { cmd: ".meme", desc: "Meme generator" },
  { cmd: ".wanted", desc: "Wanted poster" },
  { cmd: ".readmore", desc: "Readmore text" },
  { cmd: ".qrcode", desc: "QR code generator" },
  { cmd: ".tourl", desc: "URL shortener" },
];

const pluginConfig = {
  name: "menu2",
  alias: ["menu2", "menu2", "extra", "moremenu"],
  category: "menu",
  description: "Menu tambahan bot",
  usage: ".menu2",
  example: ".menu2",
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

    const lines = COMMANDS.map(
      (item) => `${item.cmd} — *${item.desc}*`
    );

    const text =
      alyaHeader("Menu 2", "📑") +
      "\n\n" +
      bracketBox("📑", "ᴇxᴛʀᴀ", lines) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu2 untuk lihat menu`) +
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
