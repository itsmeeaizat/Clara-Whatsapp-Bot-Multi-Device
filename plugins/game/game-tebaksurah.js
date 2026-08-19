// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tebaksurah",
  alias: ["tebaksurah", "guesssurah"],
  category: "game",
  description: "Tebak nama Surah dalam Al-Quran berdasarkan ayat dan terjemahannya",
  usage: ".tebaksurah [jawaban/nyerah]",
  example: ".tebaksurah",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const TEBAKSURAH_DATA = [
  { ayat: "قُلْ هُوَ اللَّهُ أَحَدٌ", terjemahan: "Katakanlah (Muhammad), 'Dialah Allah, Yang Maha Esa.'", surah: "Al-Ikhlas", nomorSurah: 112 },
  { ayat: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", terjemahan: "Katakanlah, 'Aku berlindung kepada Tuhan yang menguasai subuh (fajar)'", surah: "Al-Falaq", nomorSurah: 113 },
  { ayat: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", terjemahan: "Katakanlah, 'Aku berlindung kepada Tuhannya manusia'", surah: "An-Nas", nomorSurah: 114 },
  { ayat: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", terjemahan: "Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.", surah: "Al-Kausar", nomorSurah: 108 },
  { ayat: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", terjemahan: "Apabila telah datang pertolongan Allah dan kemenangan,", surah: "An-Nasr", nomorSurah: 110 },
  { ayat: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", terjemahan: "Binasalah kedua tangan Abu Lahab dan benar-benar binasa dia!", surah: "Al-Lahab", nomorSurah: 111 },
  { ayat: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", terjemahan: "Katakanlah (Muhammad), 'Wahai orang-orang kafir!'", surah: "Al-Kafirun", nomorSurah: 109 },
  { ayat: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", terjemahan: "Tahukah kamu (orang) yang mendustakan agama?", surah: "Al-Ma'un", nomorSurah: 107 },
  { ayat: "لِإِيلَافِ قُرَيْشٍ", terjemahan: "Karena kebiasaan orang-orang Quraisy,", surah: "Quraisy", nomorSurah: 106 },
  { ayat: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", terjemahan: "Tidakkah engkau (Muhammad) perhatikan bagaimana Tuhanmu telah bertindak terhadap pasukan bergajah?", surah: "Al-Fil", nomorSurah: 105 },
  { ayat: "وَيْلٌ لِّكُلِّ هُمَزَةٍ لُُّمَزَةٍ", terjemahan: "Celakalah bagi setiap pengumpat lagi pencela,", surah: "Al-Humazah", nomorSurah: 104 },
  { ayat: "وَالْعَصْرِ ۙ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", terjemahan: "Demi masa, sungguh manusia berada dalam kerugian,", surah: "Al-'Asr", nomorSurah: 103 },
  { ayat: "أَلْهَاكُمُ التَّكَاثُرُ", terjemahan: "Bermegah-megahan telah melalaikan kamu,", surah: "At-Takasur", nomorSurah: 102 },
  { ayat: "الْقَارِعَةُ 📑 مَا الْقَارِعَةُ", terjemahan: "Hari Kiamat, apakah Hari Kiamat itu?", surah: "Al-Qari'ah", nomorSurah: 101 },
  { ayat: "وَالْعَادِيَاتِ ضَبْحًا", terjemahan: "Demi kuda perang yang berlari kencang terengah-engah,", surah: "Al-'Adiyat", nomorSurah: 100 },
  { ayat: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", terjemahan: "Segala puji bagi Allah, Tuhan seluruh alam.", surah: "Al-Fatihah", nomorSurah: 1 },
];

global.tebaksurah_sessions = global.tebaksurah_sessions || new Map();

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.tebaksurah_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        await m.reply(
          alyaHeader("Tebak Surah", "📖") +
            "\n\n" +
            bracketBox("❓", "ᴀʏᴀᴛ", [
              `◦ *"${session.item.ayat}"*`,
              `◦ Arti: *"${session.item.terjemahan}"*`,
              `◦ Waktu tersisa: *${Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))}s*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebaksurah <jawaban> atau .tebaksurah nyerah"),
        );
        return { handled: true };
      }

      if (input.toLowerCase() === "nyerah" || input.toLowerCase() === "pass") {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Menyerah", "🏳️") +
            "\n\n" +
            bracketBox("💡", "ᴊᴀᴡᴀʙᴀɴ", [
              `◦ Ayat: *"${session.item.ayat}"*`,
              `◦ Surah: *Surah ${session.item.surah}* (Surah ke-${session.item.nomorSurah})`,
              `◦ Arti: *"${session.item.terjemahan}"*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebaksurah untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input
        .toLowerCase()
        .replace(/^(surah|surat)\s+/g, "")
        .replace(/[^a-z0-9]/g, "");

      const cleanAnswer = session.item.surah
        .toLowerCase()
        .replace(/^(al|an|at|as|az|ar)\s*[-']?/g, "")
        .replace(/[^a-z0-9]/g, "");

      const fullCleanAnswer = session.item.surah.toLowerCase().replace(/[^a-z0-9]/g, "");

      const isMatch =
        cleanInput === cleanAnswer ||
        cleanInput === fullCleanAnswer ||
        (cleanInput.length >= 3 && (fullCleanAnswer.includes(cleanInput) || cleanAnswer.includes(cleanInput)));

      if (isMatch) {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Tebakan Tepat!", "🎉") +
            "\n\n" +
            bracketBox("🏆", "ʜᴀꜱɪ🇱", [
              `◦ Penjawab: *@${(m.sender || "").split("@")[0]}*`,
              `◦ Surah: *Surah ${session.item.surah}* (Surah ke-${session.item.nomorSurah})`,
              `◦ Ayat: *"${session.item.ayat}"*`,
              `◦ Arti: *"${session.item.terjemahan}"*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Masya Allah! Ketik .tebaksurah untuk kuis selanjutnya."),
        );
        return { handled: true };
      } else {
        await m.reply(
          alyaHeader("Salah!", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ *" ${input} "* bukan nama Surah dari ayat ini!`,
              `◦ Coba lagi atau ketik *.tebaksurah nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = TEBAKSURAH_DATA[Math.floor(Math.random() * TEBAKSURAH_DATA.length)];
    const timeoutMs = 60000;
    const endTime = Date.now() + timeoutMs;

    const timer = setTimeout(async () => {
      if (sessions.has(chatId)) {
        sessions.delete(chatId);
        try {
          await sock.sendMessage(chatId, {
            text:
              alyaHeader("Waktu Habis", "⏰") +
              "\n\n" +
              bracketBox("⌛", "ʜᴀꜱɪ🇱", [
                `◦ Ayat: *"${item.ayat}"*`,
                `◦ Surah: *Surah ${item.surah}* (Surah ke-${item.nomorSurah})`,
                `◦ Arti: *"${item.terjemahan}"*`,
              ]) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .tebaksurah untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    sessions.set(chatId, { item, timer, endTime });

    await m.reply(
      alyaHeader("Tebak Surah", "📖") +
        "\n\n" +
        bracketBox("❓", "ᴀʏᴀᴛ", [
          `◦ *"${item.ayat}"*`,
          `◦ Arti: *"${item.terjemahan}"*`,
          `◦ Waktu: *60 detik*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Tebak nama Surahnya! Ketik: .tebaksurah <jawaban>"),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]),
    );
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
