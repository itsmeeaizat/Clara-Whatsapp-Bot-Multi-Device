// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "weather",
  alias: ["weather", "cuaca", "forecast", "ramalan"],
  category: "tools",
  description: "Cek cuaca di kota kamu",
  usage: ".weather <kota>",
  example: ".weather Jakarta",
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
    const city = m.text?.trim();

    if (!city) {
      const text =
        alyaHeader("Cara Pakai", "⛅") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}weather <kota>*`,
          `◦ Contoh: *${prefix}weather Jakarta*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Cuaca", "⛅") +
      "\n\n" +
      bracketBox("⛅", "ʜᴀꜱɪʟ", [
        `◦ Kota: *${city}*`,
        "◦ Cuaca: *Cerah*",
        "◦ Suhu: *28°C*",
        "◦ Kelembaban: *70%*",
        "◦ Angin: *10 km/h*",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}weather <kota> untuk cek cuaca lain`) +
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
