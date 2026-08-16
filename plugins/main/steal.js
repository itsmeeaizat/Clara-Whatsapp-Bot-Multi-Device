import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "steal",
  alias: ["steal", "takesticker", "ambilstiker"],
  category: "sticker",
  description: "Ambil sticker dari chat orang lain",
  usage: "Reply sticker dengan .steal",
  example: ".steal (reply sticker)",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const quoted = m.quoted;

    if (!quoted || !quoted.message?.stickerMessage) {
      const text = alyaHeader("Cara Pakai", "🥷") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Reply sticker dengan *${prefix}steal*`,
        ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const buffer = await quoted.download();
    await sock.sendMessage(m.chat, {
      sticker: buffer,
    }, { quoted: m });

    const info = alyaHeader("Steal Sticker", "🥷") + "\n\n" +
      bracketBox("🥷", "ʀᴇꜱᴜʟᴛ", ["◦ Status: *Berhasil diambil*"]) + "\n\n" +
      separator() + "\n" + tipText(`Reply sticker dengan ${prefix}steal untuk ambil lagi`);
    await m.reply(info);
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
