import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const SUIT = { batu: "🪨", kertas: "📄", gunting: "✂️" };
const BEATS = { batu: "gunting", kertas: "batu", gunting: "kertas" };

const pluginConfig = {
  name: "suit",
  alias: ["suit", "suten", "batukertasgunting", "rps"],
  category: "fun",
  description: "Suit (Batu Kertas Gunting)",
  usage: ".suit <batu|kertas|gunting>",
  example: ".suit batu",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const input = m.text?.trim()?.toLowerCase();

    if (!input || !SUIT[input]) {
      const text = alyaHeader("Cara Pakai", "✊") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}suit <batu|kertas|gunting>*`,
        `◦ Contoh: *${prefix}suit batu*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const choices = ["batu", "kertas", "gunting"];
    const bot = choices[Math.floor(Math.random() * 3)];

    let hasil;
    if (input === bot) {
      hasil = "Seri! 🤝";
    } else if (BEATS[input] === bot) {
      hasil = "Kamu Menang! 🎉";
    } else {
      hasil = "Bot Menang! 🤖";
    }

    const text = alyaHeader("Suit", "✊") + "\n\n" +
      bracketBox("✊", "ʙᴀᴛᴜ ᴋᴇʀᴛᴀꜱ ɢᴜɴᴛɪɴɢ", [
        `◦ Kamu: *${SUIT[input]} ${input}*`,
        `◦ Bot: *${SUIT[bot]} ${bot}*`,
        `◦ Hasil: *${hasil}*`,
      ]) + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}suit <batu|kertas|gunting> untuk main lagi`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text = alyaHeader("Gagal", "❌") + "\n\n" + bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`, `◦ Alasan: *${error.message}*`,
    ]) + "\n\n" + separator() + "\n" + tipText(`Coba lagi nanti`);
    await m.reply(text);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
