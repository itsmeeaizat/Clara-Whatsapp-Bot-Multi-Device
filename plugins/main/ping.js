import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "ping",
  alias: ["ping", "speed", "latency", "pong"],
  category: "main",
  description: "Cek kecepatan respon bot",
  usage: ".ping",
  example: ".ping",
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
    const start = Date.now();
    await m.react("🕐");
    const end = Date.now();
    const ping = end - start;
    const status = ping < 200 ? "Cepat" : ping < 500 ? "Sedang" : "Lambat";

    const text =
      alyaHeader("Ping", "🕐") +
      "\n\n" +
      bracketBox("🕐", "ʟᴀᴛᴇɴᴄʏ", [
        `◦ Ping: *${ping}ms*`,
        `◦ Status: *${status}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`) +
      "\n" +
      tipText(`Ketik ${prefix}aihelp untuk tanya AI`) +
      "\n" +
      tipText(`Ketik ${prefix}allmenu untuk all menu`);

    await sock.sendMessage(m.chat, {
      text,
      buttons: [
        {
          type: 1,
          buttonId: `menu_ping_${Date.now()}`,
          buttonText: { displayText: "📋 Menu" },
          value: "menu",
        },
        {
          type: 1,
          buttonId: `aihelp_ping_${Date.now()}`,
          buttonText: { displayText: "💡 Tanya AI" },
          value: "aihelp",
        },
        {
          type: 1,
          buttonId: `allmenu_ping_${Date.now()}`,
          buttonText: { displayText: "📌 All Menu" },
          value: "allmenu",
        },
      ],
      headerType: 1,
    });

    await m.react("✅");
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
