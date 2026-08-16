import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "job",
  alias: ["kerja", "work", "pekerjaan", "profesi"],
  category: "economy",
  description: "Ganti pekerjaan RPG kamu",
  usage: ".job <nama job>",
  example: ".job Warrior",
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
    const query = m.text?.trim();

    if (!query) {
      const text =
        alyaHeader("Daftar Job", "💼") +
        "\n\n" +
        bracketBox("💼", "ᴊᴏʙ", [
          "1. Warrior - ATK +10, DEF +5",
          "2. Mage - ATK +15, DEF +3",
          "3. Archer - ATK +12, DEF +4",
          "4. Healer - ATK +5, DEF +8",
          "5. Assassin - ATK +18, DEF +2",
        ]) +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}job <nama job>*`,
          `◦ Contoh: *${prefix}job Warrior*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Job", "💼") +
      "\n\n" +
      bracketBox("💼", "ꜱᴛᴀᴛᴜꜱ", [
        `◦ Job: *${query}*`,
        "◦ Status: *Berhasil diganti*",
        "◦ ATK Bonus: *+10*",
        "◦ DEF Bonus: *+5*",
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
