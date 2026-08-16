import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "heal",
  alias: ["heal", "nyembuh", "cure", "recover", "potion"],
  category: "game",
  description: "Sembuhkan HP kamu",
  usage: ".heal",
  example: ".heal",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const healAmount = 50;
    const maxHp = 100;
    const currentHp = 40;
    const newHp = Math.min(maxHp, currentHp + healAmount);

    const text =
      alyaHeader("Heal", "❤️‍🩹") +
      "\n\n" +
      bracketBox("❤️‍🩹", "ʜᴀꜱɪʟ", [
        `◦ Heal: *+${healAmount}*`,
        `◦ HP: *${newHp}/${maxHp}*`,
        "◦ Item: *Potion*",
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}heal untuk sembuh lagi`) +
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
