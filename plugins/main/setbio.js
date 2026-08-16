import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "setbio",
  alias: ["setbio", "gantibio", "bio", "setstatus"],
  category: "owner",
  description: "Ganti bio/status bot (owner only)",
  usage: ".setbio <bio>",
  example: ".setbio Clara-AI Bot RPG",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const bio = m.text?.trim();

    if (!bio) {
      const text =
        alyaHeader("Cara Pakai", "📝") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}setbio <bio>*`,
          `◦ Contoh: *${prefix}setbio Clara-AI Bot RPG*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    await sock.updateProfileStatus(bio);

    const text =
      alyaHeader("Set Bio", "📝") +
      "\n\n" +
      bracketBox("📝", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Bio Baru: *${bio}*`,
        "◦ Status: *SUCCESS*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
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
