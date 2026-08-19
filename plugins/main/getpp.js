// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "getpp",
  alias: ["getpp", "pp", "profilepic", "photoprofile"],
  category: "info",
  description: "Ambil foto profil user/group",
  usage: ".getpp [@target/id]",
  example: ".getpp @username",
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
    const target = raw.replace(/^\.getpp\s+/i, "").trim();
    const jid = target
      ? target.includes("@")
        ? target
        : `${target.replace(/[^0-9]/g, "")}@s.whatsapp.net`
      : m.sender;

    let url = "";
    try {
      const profile = await sock.profilePictureUrl(jid, "image");
      url = profile || "";
    } catch {
      url = "";
    }

    if (!url) {
      const text =
        alyaHeader("Get PP", "📸") +
        "\n\n" +
        bracketBox("📸", "ᴘʀᴏꜰɪʟᴇ", [
          "◦ Status: *Tidak ada foto profil*",
          "◦ Alasan: *Target belum mengatur foto profil*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.sendMessage(m.chat, {
      image: { url },
      caption: `◦ Target: *${target || "Kamu"}*`,
    }, { quoted: m });

    const text =
      alyaHeader("Get PP", "📸") +
      "\n\n" +
      bracketBox("📸", "ᴘʀᴏꜰɪʟᴇ", [
        `◦ Target: *${target || "Kamu"}*`,
        "◦ Status: *Berhasil*",
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
