import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const WIRID = [
  { judul: "Tasbih", arab: "سُبْحَانَ اللَّهِ", latin: "Subhanallah", jumlah: "33x", arti: "Maha Suci Allah" },
  { judul: "Tahmid", arab: "الْحَمْدُ لِلَّهِ", latin: "Alhamdulillah", jumlah: "33x", arti: "Segala puji bagi Allah" },
  { judul: "Takbir", arab: "اللَّهُ أَكْبَرُ", latin: "Allahu Akbar", jumlah: "33x", arti: "Allah Maha Besar" },
  { judul: "Tahlil", arab: "لَا إِلَهَ إِلَّا اللَّهُ", latin: "La ilaha illallah", jumlah: "100x", arti: "Tiada tuhan selain Allah" },
  { judul: "Istighfar", arab: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ", latin: "Astaghfirullah al-'Azhim", jumlah: "100x", arti: "Aku memohon ampun kepada Allah Yang Maha Agung" },
  { judul: "Sholawat", arab: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", latin: "Allahumma sholli 'ala Muhammad", jumlah: "100x", arti: "Ya Allah, limpahkan rahmat kepada Nabi Muhammad" },
  { judul: "Hauqalah", arab: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", latin: "La hawla wa la quwwata illa billah", jumlah: "100x", arti: "Tiada daya dan kekuatan kecuali dengan pertolongan Allah" },
];

const pluginConfig = {
  name: "wirid",
  alias: ["wirid", "dzikir", "dzikirharian"],
  category: "religi",
  description: "Wird & dzikir harian setelah sholat",
  usage: ".wirid",
  example: ".wirid",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const list = WIRID.map(w =>
      `◦ *${w.judul}*\n  ${w.arab}\n  ${w.latin} (${w.jumlah})\n  ${w.arti}`
    ).join("\n\n");

    const text = alyaHeader("Wirid & Dzikir", "📿") + "\n\n" +
      bracketBox("📿", "ᴡɪʀɪᴅ ᴅᴢɪᴋɪʀ", [
        "◦ Dibaca setelah sholat fardhu",
        `◦ Total: *${WIRID.length} dzikir*`,
      ]) + "\n\n" + list + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text = alyaHeader("Gagal", "❌") + "\n\n" + bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`, `◦ Alasan: *${error.message}*`,
    ]) + "\n\n" + separator() + "\n" + tipText(`Coba lagi nanti`);
    await m.reply(text);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
