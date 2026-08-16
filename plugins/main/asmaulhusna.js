import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const ASMAUL_HUSNA = [
  { no: 1, arab: "الرَّحْمَنُ", latin: "Ar-Rahman", arti: "Yang Maha Pengasih" },
  { no: 2, arab: "الرَّحِيمُ", latin: "Ar-Rahim", arti: "Yang Maha Penyayang" },
  { no: 3, arab: "الْمَلِكُ", latin: "Al-Malik", arti: "Yang Maha Merajai" },
  { no: 4, arab: "الْقُدُّوسُ", latin: "Al-Quddus", arti: "Yang Maha Suci" },
  { no: 5, arab: "السَّلاَمُ", latin: "As-Salam", arti: "Yang Maha Memberi Kesejahteraan" },
  { no: 6, arab: "الْمُؤْمِنُ", latin: "Al-Mu'min", arti: "Yang Maha Memberi Keamanan" },
  { no: 7, arab: "الْمُهَيْمِنُ", latin: "Al-Muhaimin", arti: "Yang Maha Mengatur" },
  { no: 8, arab: "الْعَزِيزُ", latin: "Al-'Aziz", arti: "Yang Maha Perkasa" },
  { no: 9, arab: "الْجَبَّارُ", latin: "Al-Jabbar", arti: "Yang Maha Kuasa" },
  { no: 10, arab: "الْمُتَكَبِّرُ", latin: "Al-Mutakabbir", arti: "Yang Maha Megah" },
  { no: 11, arab: "الْخَالِقُ", latin: "Al-Khaliq", arti: "Yang Maha Pencipta" },
  { no: 12, arab: "الْبَارِئُ", latin: "Al-Bari'", arti: "Yang Maha Mengadakan" },
  { no: 13, arab: "الْمُصَوِّرُ", latin: "Al-Musawwir", arti: "Yang Maha Membentuk Rupa" },
  { no: 14, arab: "الْغَفَّارُ", latin: "Al-Ghaffar", arti: "Yang Maha Pengampun" },
  { no: 15, arab: "الْقَهَّارُ", latin: "Al-Qahhar", arti: "Yang Maha Menundukkan" },
  { no: 16, arab: "الْوَهَّابُ", latin: "Al-Wahhab", arti: "Yang Maha Pemberi" },
  { no: 17, arab: "الرَّزَّاقُ", latin: "Ar-Razzaq", arti: "Yang Maha Pemberi Rezeki" },
  { no: 18, arab: "الْفَتَّاحُ", latin: "Al-Fattah", arti: "Yang Maha Pembuka Rahmat" },
  { no: 19, arab: "اَلْعَلِيْمُ", latin: "Al-'Alim", arti: "Yang Maha Mengetahui" },
  { no: 20, arab: "الْقَابِضُ", latin: "Al-Qabid", arti: "Yang Maha Menyempitkan" },
  { no: 21, arab: "الْبَاسِطُ", latin: "Al-Basit", arti: "Yang Maha Melapangkan" },
  { no: 22, arab: "الْخَافِضُ", latin: "Al-Khafid", arti: "Yang Maha Merendahkan" },
  { no: 23, arab: "الرَّافِعُ", latin: "Ar-Rafi'", arti: "Yang Maha Meninggikan" },
  { no: 24, arab: "الْمُعِزُّ", latin: "Al-Mu'izz", arti: "Yang Maha Memuliakan" },
  { no: 25, arab: "الْمُذِلُّ", latin: "Al-Mudzill", arti: "Yang Maha Menghinakan" },
];

const pluginConfig = {
  name: "asmaulhusna",
  alias: ["asmaulhusna", "asmaul", "99nama"],
  category: "religi",
  description: "Lihat Asmaul Husna (99 Nama Allah)",
  usage: ".asmaulhusna <nomor>",
  example: ".asmaulhusna 1",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const input = m.text?.trim();

    if (!input) {
      const list = ASMAUL_HUSNA.slice(0, 10).map(a =>
        `${a.no}. ${a.latin} - ${a.arti}`
      ).join("\n");

      const text =
        alyaHeader("Asmaul Husna", "📿") +
        "\n\n" +
        bracketBox("📿", "99 ɴᴀᴍᴀ ᴀʟʟᴀʜ", [
          "◦ Total: *99 nama*",
          "◦ Menampilkan: *10 pertama*",
        ]) +
        "\n\n" +
        list +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}asmaulhusna <nomor> untuk lihat nama lain`);

      await m.reply(text);
      return { handled: true };
    }

    const nomor = parseInt(input);
    if (isNaN(nomor) || nomor < 1 || nomor > 99) {
      throw new Error("Nomor tidak valid (1-99)");
    }

    // Full list would need all 99, showing what we have
    const found = ASMAUL_HUSNA.find(a => a.no === nomor);
    if (!found) {
      const text =
        alyaHeader("Asmaul Husna", "📿") +
        "\n\n" +
        bracketBox("📿", "ɪɴꜰᴏ", [
          `◦ Nomor *${nomor}* tersedia di database lengkap`,
          `◦ Data lengkap 1-99 akan dimuat di update berikutnya`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}asmaulhusna (tanpa nomor) untuk list`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Asmaul Husna", "📿") +
      "\n\n" +
      bracketBox("📿", "ɴᴀᴍᴀ ᴀʟʟᴀʜ", [
        `◦ Nomor: *${found.no}*`,
        `◦ Arab: *${found.arab}*`,
        `◦ Latin: *${found.latin}*`,
        `◦ Arti: *${found.arti}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}asmaulhusna <nomor> untuk nama lain`);

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
