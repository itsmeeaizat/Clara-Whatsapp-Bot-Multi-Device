import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "calculator",
  alias: ["calc", "kalkulator", "hitung", "calculator"],
  category: "tools",
  description: "Kalkulator matematika",
  usage: ".calc <ekspresi>",
  example: ".calc 5 + 3 * 2",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const ALLOWED = /^[0-9+\-*/().% ]+$/;

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const expr = m.text?.trim();

    if (!expr) {
      const text =
        alyaHeader("Cara Pakai", "🧮") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}calc <ekspresi>*`,
          `◦ Contoh: *${prefix}calc 5 + 3 * 2*`,
          "◦ Operator: *+ - * / %*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (!ALLOWED.test(expr)) {
      const text =
        alyaHeader("Calculator", "🧮") +
        "\n\n" +
        bracketBox("🧮", "ᴇʀʀᴏʀ", [
          `◦ Ekspresi: *${expr}*`,
          "◦ Status: *Ekspresi tidak didukung*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}calc <ekspresi> untuk menghitung lagi`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

      await m.reply(text);
      return { handled: true };
    }

    let result;
    try {
      // eslint-disable-next-line no-new-func
      result = new Function(`return ${expr}`)();
    } catch {
      result = "ERROR";
    }

    const text =
      alyaHeader("Calculator", "🧮") +
      "\n\n" +
      bracketBox("🧮", "ʜᴀꜱɪʟ", [
        `◦ Ekspresi: *${expr}*`,
        `◦ Hasil: *${result}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}calc <ekspresi> untuk menghitung lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

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
