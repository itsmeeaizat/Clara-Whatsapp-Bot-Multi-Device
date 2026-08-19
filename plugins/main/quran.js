// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "quran",
  alias: ["quran", "surah", "alquran", "quransurah"],
  category: "religi",
  description: "Baca Al-Quran surah & ayat",
  usage: ".quran <nomor surah> | .quran list",
  example: ".quran 1",
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
    const input = m.text?.trim();

    if (!input) {
      const text =
        alyaHeader("Cara Pakai", "📖") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}quran <nomor surah>*`,
          `◦ Contoh: *${prefix}quran 1*`,
          `◦ Daftar surah: *${prefix}quran list*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (input.toLowerCase() === "list") {
      const res = await axios.get("https://equran.id/api/v2/surat", { timeout: 10000 });
      const surahs = res.data?.data || [];
      const list = surahs.slice(0, 20).map(s =>
        `${s.nomor}. *${s.namaLatin}* (${s.arti}) - ${s.jumlahAyat} ayat`
      ).join("\n");

      const text =
        alyaHeader("Al-Quran", "📖") +
        "\n\n" +
        bracketBox("📖", "ᴅᴀꜰᴛᴀʀ ꜱᴜʀᴀʜ", [
          "◦ Total: *114 surah*",
        ]) +
        "\n\n" +
        list +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}quran <nomor> untuk baca surah`);

      await m.reply(text);
      return { handled: true };
    }

    const nomor = parseInt(input);
    if (isNaN(nomor) || nomor < 1 || nomor > 114) {
      throw new Error("Nomor surah tidak valid (1-114)");
    }

    const res = await axios.get(`https://equran.id/api/v2/surat/${nomor}`, { timeout: 10000 });
    const surah = res.data?.data;
    if (!surah) throw new Error("Surah tidak ditemukan");

    // Show first 5 ayat
    const ayatList = (surah.ayat || []).slice(0, 5).map(a =>
      `*${a.nomorAyat}.* ${a.teksArab}\n${a.teksLatin}\n${a.teksIndonesia}`
    ).join("\n\n");

    const text =
      alyaHeader("Al-Quran", "📖") +
      "\n\n" +
      bracketBox("📖", "ꜱᴜʀᴀʜ", [
        `◦ Surah: *${surah.namaLatin}* (${surah.arti})*`,
        `◦ Arab: *${surah.nama}*`,
        `◦ Jumlah Ayat: *${surah.jumlahAyat}*`,
        `◦ Turun di: *${surah.tempatTurun}*`,
      ]) +
      "\n\n" +
      ayatList +
      (surah.jumlahAyat > 5 ? "\n\n..." : "") +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Menampilkan 5 ayat pertama dari ${surah.jumlahAyat} ayat`) +
      "\n" +
      tipText(`Ketik ${prefix}quran <nomor> untuk surah lain`);

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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
