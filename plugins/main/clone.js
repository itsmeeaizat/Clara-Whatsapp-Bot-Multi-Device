// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "clone",
  alias: ["clone", "ganti", "clonepp", "gantipp"],
  category: "owner",
  description: "Clone foto profil grup (owner only)",
  usage: ".clone",
  example: ".clone",
  isOwner: true,
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

    if (!m.isGroup) {
      const text =
        alyaHeader("Clone", "👤") +
        "\n\n" +
        bracketBox("⚠️", "ᴘᴇʀɪɴɢᴀᴛᴀɴ", [
          "◦ Perintah ini hanya untuk grup.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const picture = await sock.profilePictureUrl(m.chat, "image").catch(() => null);

    if (!picture) {
      const text =
        alyaHeader("Clone", "👤") +
        "\n\n" +
        bracketBox("⚠️", "ᴘᴇʀɪɴɢᴀᴛᴀɴ", [
          "◦ Grup ini belum memiliki foto profil.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const res = await fetch(picture);
    const buffer = Buffer.from(await res.arrayBuffer());

    await sock.sendMessage(m.chat, {
      image: buffer,
      caption: "Clone foto profil grup berhasil.",
    });

    const text =
      alyaHeader("Clone", "👤") +
      "\n\n" +
      bracketBox("👤", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Group: *${m.chat}*`,
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
