// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "emojimix",
  alias: ["emojimix", "emix", "mixemoji"],
  category: "sticker",
  description: "Mix 2 emoji jadi 1 sticker",
  usage: ".emojimix 😂+😍",
  example: ".emojimix 😂+😍",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const text = m.text?.trim();

    if (!text) {
      const reply = alyaHeader("Cara Pakai", "🧩") + "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}emojimix <emoji1>+<emoji2>*`,
          `◦ Contoh: *${prefix}emojimix 😂+😍*`,
        ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(reply);
      return { handled: true };
    }

    const parts = text.split("+");
    if (parts.length < 2) throw new Error("Format: .emojimix 😂+😍");

    const emoji1 = parts[0].trim();
    const emoji2 = parts[1].trim();

    // Try emojimix API alternatives
    const axios = (await import("axios")).default;
    const mixUrl = `https://emojik-vercel.vercel.app/${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

    try {
      const res = await axios.get(mixUrl, { responseType: "arraybuffer", timeout: 10000 });
      if (res.status === 200 && res.data.length > 100) {
        await sock.sendMessage(m.chat, {
          sticker: Buffer.from(res.data),
        }, { quoted: m });

        const info = alyaHeader("Emoji Mix", "🧩") + "\n\n" +
          bracketBox("🧩", "ʀᴇꜱᴜʟᴛ", [
            `◦ Emoji 1: *${emoji1}*`,
            `◦ Emoji 2: *${emoji2}*`,
            "◦ Status: *Berhasil*",
          ]) + "\n\n" + separator() + "\n" +
          tipText(`Ketik ${prefix}emojimix <emoji1>+<emoji2> untuk mix lagi`);
        await m.reply(info);
        return { handled: true };
      }
    } catch {}

    // Fallback: render both emojis side by side as sticker
    const { createCanvas } = await import("@napi-rs/canvas");
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 512, 512);
    ctx.font = "200px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji1, 170, 256);
    ctx.fillText(emoji2, 342, 256);

    const buffer = canvas.toBuffer("image/png");
    await sock.sendMessage(m.chat, {
      sticker: buffer,
    }, { quoted: m });

    const info = alyaHeader("Emoji Mix", "🧩") + "\n\n" +
      bracketBox("🧩", "ʀᴇꜱᴜʟᴛ", [
        `◦ Emoji 1: *${emoji1}*`,
        `◦ Emoji 2: *${emoji2}*`,
        "◦ Status: *Berhasil (fallback)*",
      ]) + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}emojimix <emoji1>+<emoji2> untuk mix lagi`);
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
