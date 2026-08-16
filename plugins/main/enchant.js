import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "enchant",
  alias: ["enchant", "upgrade", "enhance", "tempa", "enchant"],
  category: "game",
  description: "Enchant equipment untuk bonus stats",
  usage: ".enchant <item>",
  example: ".enchant Sword",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const item = m.text?.trim();

    if (!item) {
      const text =
        alyaHeader("Cara Pakai", "⚙️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}enchant <item>*`,
          `◦ Contoh: *${prefix}enchant Sword*`,
          "◦ Biaya: *200 Gold + 1 Crystal*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const bonus = Math.floor(Math.random() * 10) + 1;

    const text =
      alyaHeader("Enchant", "⚙️") +
      "\n\n" +
      bracketBox("⚙️", "ʜᴀꜱɪʟ", [
        `◦ Item: *${item}*`,
        `◦ Bonus: *+${bonus}% Stats*`,
        "◦ Biaya: *200 Gold*",
        "◦ Status: *Berhasil*",
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
