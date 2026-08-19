// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tebakbendera",
  alias: ["tebakbendera", "guessflag"],
  category: "game",
  description: "Tebak nama negara berdasarkan emoji bendera dan petunjuk",
  usage: ".tebakbendera [jawaban/nyerah]",
  example: ".tebakbendera",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const TEBAKBENDERA_DATA = [
  { bendera: "🇮🇩", negara: "Indonesia", petunjuk: "Negara kepulauan terbesar di Asia Tenggara" },
  { bendera: "🇯🇵", negara: "Jepang", petunjuk: "Negara Matahari Terbit di Asia Timur" },
  { bendera: "🇰🇷", negara: "Korea Selatan", petunjuk: "Negara yang terkenal dengan K-Pop dan K-Dramanya" },
  { bendera: "🇵🇸", negara: "Palestina", petunjuk: "Negara di Timur Tengah dengan ibu kota Yerusalem" },
  { bendera: "🇧🇷", negara: "Brasil", petunjuk: "Negara terbesar di Amerika Selatan, terkenal dengan sepak bola" },
  { bendera: "🇬🇧", negara: "Inggris", petunjuk: "Negara di Britania Raya dengan ibu kota London" },
  { bendera: "🇺🇸", negara: "Amerika Serikat", petunjuk: "Negara adidaya dengan 50 negara bagian" },
  { bendera: "🇫🇷", negara: "Prancis", petunjuk: "Negara di Eropa yang terkenal dengan Menara Eiffel" },
  { bendera: "🇩🇪", negara: "Jerman", petunjuk: "Negara Eropa yang terkenal dengan industri otomotif canggihnya" },
  { bendera: "🇮🇹", negara: "Italia", petunjuk: "Negara asal Pizza dan Colosseum" },
  { bendera: "🇸🇦", negara: "Arab Saudi", petunjuk: "Negara di mana kota suci Mekkah dan Madinah berada" },
  { bendera: "🇪🇬", negara: "Mesir", petunjuk: "Negara Afrika Utara yang terkenal dengan Piramida Giza" },
  { bendera: "🇦🇺", negara: "Australia", petunjuk: "Negara benua yang merupakan habitat Kanguru dan Koala" },
  { bendera: "🇨🇦", negara: "Kanada", petunjuk: "Negara di Amerika Utara berbendera lambang daun Maple" },
  { bendera: "🇨🇳", negara: "Tiongkok", petunjuk: "Negara dengan Tembok Besar dan populasi terbesar di dunia" },
  { bendera: "🇮🇳", negara: "India", petunjuk: "Negara asal Taj Mahal dan industri film Bollywood" },
  { bendera: "🇷🇺", negara: "Rusia", petunjuk: "Negara dengan wilayah terluas di dunia" },
  { bendera: "🇲🇾", negara: "Malaysia", petunjuk: "Negara tetangga Indonesia dengan Menara Kembar Petronas" },
  { bendera: "🇸🇬", negara: "Singapura", petunjuk: "Negara pulau dengan patung Merlion" },
  { bendera: "🇹🇭", negara: "Thailand", petunjuk: "Negara Gajah Putih di Asia Tenggara" },
  { bendera: "🇻🇳", negara: "Vietnam", petunjuk: "Negara Asia Tenggara yang terkenal dengan sup Pho" },
  { bendera: "🇵🇭", negara: "Filipina", petunjuk: "Negara kepulauan di Asia Tenggara dengan ibu kota Manila" },
  { bendera: "🇳🇱", negara: "Belanda", petunjuk: "Negara kincir angin dan Bunga Tulip di Eropa" },
  { bendera: "🇪🇸", negara: "Spanyol", petunjuk: "Negara Eropa asal tarian Flamenco dan klub Real Madrid" },
  { bendera: "🇦🇷", negara: "Argentina", petunjuk: "Negara asal pemain sepak bola Lionel Messi" },
  { bendera: "🇲🇽", negara: "Meksiko", petunjuk: "Negara Amerika Tengah asal makanan Tacos dan Sombrero" },
  { bendera: "🇿🇦", negara: "Afrika Selatan", petunjuk: "Negara paling selatan di benua Afrika" },
  { bendera: "🇹🇷", negara: "Turki", petunjuk: "Negara yang membentang di dua benua: Asia dan Eropa" },
  { bendera: "🇬🇷", negara: "Yunani", petunjuk: "Negara kelahiran Olimpiade dan peradaban kuno" },
  { bendera: "🇵🇹", negara: "Portugal", petunjuk: "Negara asal pemain sepak bola Cristiano Ronaldo" },
  { bendera: "🇨🇭", negara: "Swiss", petunjuk: "Negara pegunungan Alpen yang terkenal dengan cokelat dan jam tangannya" },
  { bendera: "🇳🇿", negara: "Selandia Baru", petunjuk: "Negara kepulauan dekat Australia yang terkenal dengan burung Kiwi" },
];

global.tebakbendera_sessions = global.tebakbendera_sessions || new Map();

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.tebakbendera_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        await m.reply(
          alyaHeader("Tebak Bendera", "🚩") +
            "\n\n" +
            bracketBox("❓", "ꜱᴏᴀʟ", [
              `◦ Bendera: ${session.item.bendera}`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
              `◦ Waktu tersisa: *${Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))}s*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebakbendera <jawaban> atau .tebakbendera nyerah"),
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
              `◦ Bendera: ${session.item.bendera}`,
              `◦ Negara: *${session.item.negara}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebakbendera untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanAnswer = session.item.negara.toLowerCase().replace(/[^a-z0-9]/g, "");

      const isMatch =
        cleanInput === cleanAnswer ||
        (cleanInput.length >= 4 && (cleanAnswer.includes(cleanInput) || cleanInput.includes(cleanAnswer)));

      if (isMatch) {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Tebakan Tepat!", "🎉") +
            "\n\n" +
            bracketBox("🏆", "ʜᴀꜱɪ🇱", [
              `◦ Penjawab: *@${(m.sender || "").split("@")[0]}*`,
              `◦ Bendera: ${session.item.bendera}`,
              `◦ Negara: *${session.item.negara}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Hebat! Ketik .tebakbendera untuk tebakan bendera lain."),
        );
        return { handled: true };
      } else {
        await m.reply(
          alyaHeader("Salah!", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ *" ${input} "* bukan nama negara pemilik bendera ini!`,
              `◦ Coba lagi atau ketik *.tebakbendera nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = TEBAKBENDERA_DATA[Math.floor(Math.random() * TEBAKBENDERA_DATA.length)];
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
                `◦ Bendera: ${item.bendera}`,
                `◦ Negara: *${item.negara}*`,
                `◦ Petunjuk: *${item.petunjuk}*`,
              ]) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .tebakbendera untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    sessions.set(chatId, { item, timer, endTime });

    await m.reply(
      alyaHeader("Tebak Bendera", "🚩") +
        "\n\n" +
        bracketBox("❓", "ꜱᴏᴀʟ", [
          `◦ Bendera: ${item.bendera}`,
          `◦ Petunjuk: *${item.petunjuk}*`,
          `◦ Waktu: *60 detik*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Tebak nama negaranya! Ketik: .tebakbendera <jawaban>"),
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
