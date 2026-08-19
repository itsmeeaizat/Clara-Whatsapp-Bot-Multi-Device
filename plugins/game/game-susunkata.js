// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "susunkata",
  alias: ["susunkata", "arrange"],
  category: "game",
  description: "Permainan menyusun kata acak (scrambled word) menjadi kata yang benar",
  usage: ".susunkata [jawaban/nyerah]",
  example: ".susunkata",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const SUSUNKATA_DATA = [
  { kata: "INDONESIA", petunjuk: "Negara kepulauan terbesar di dunia" },
  { kata: "KOMPUTER", petunjuk: "Perangkat elektronik untuk mengolah data" },
  { kata: "MATAHARI", petunjuk: "Pusat tata surya yang memancarkan cahaya" },
  { kata: "PERPUSTAKAAN", petunjuk: "Tempat menyimpan dan membaca berbagai buku" },
  { kata: "CENDERAWASIH", petunjuk: "Burung indah asal Papua yang dijuluki burung surga" },
  { kata: "ASTRONOT", petunjuk: "Orang yang melakukan perjalanan ke luar angkasa" },
  { kata: "SINGAPURA", petunjuk: "Negara tetangga Indonesia dengan ikon Patung Merlion" },
  { kata: "FOTOGRAFI", petunjuk: "Seni atau proses menghasilkan gambar dengan cahaya" },
  { kata: "KACAMATA", petunjuk: "Alat bantu penglihatan berlensa" },
  { kata: "SEKOLAH", petunjuk: "Lembaga tempat belajar dan mengajar" },
  { kata: "KATULISTIWA", petunjuk: "Garis khayal yang membagi bumi menjadi dua belahan" },
  { kata: "TELEVISI", petunjuk: "Media massa elektronik penayang gambar dan suara" },
  { kata: "SEPAKBOLA", petunjuk: "Olahraga permainan tim dengan 11 pemain" },
  { kata: "HELIKOPTER", petunjuk: "Pesawat terbang berkipas baling-baling di atasnya" },
  { kata: "PRAMUKA", petunjuk: "Organisasi kepanduan bagi pemuda Indonesia" },
  { kata: "BASKETBALL", petunjuk: "Olahraga bola keranjang yang dimainkan 5 orang per tim" },
  { kata: "BOROBUDUR", petunjuk: "Candi Buddha terbesar di dunia di Magelang" },
  { kata: "PEMANDANGAN", petunjuk: "Keadaan alam yang indah dipandang mata" },
  { kata: "KECERDASAN", petunjuk: "Kemampuan memahami dan memecahkan masalah" },
  { kata: "SMARTPHONE", petunjuk: "Telepon genggam dengan fitur canggih" },
  { kata: "PANCASILA", petunjuk: "Dasar negara dan pedoman hidup bangsa Indonesia" },
  { kata: "KATASTROPI", petunjuk: "Bencana alam atau malapetaka besar" },
];

global.susunkata_sessions = global.susunkata_sessions || new Map();

function scrambleWord(word) {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const scrambled = letters.join("");
  return scrambled === word ? scrambleWord(word) : scrambled;
}

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.susunkata_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        await m.reply(
          alyaHeader("Susun Kata", "🧩") +
            "\n\n" +
            bracketBox("❓", "ꜱᴏᴀʟ", [
              `◦ Kata Acak: *${session.scrambled.split("").join(" ")}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
              `◦ Waktu tersisa: *${Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))}s*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .susunkata <jawaban> atau .susunkata nyerah"),
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
              `◦ Kata Acak: *${session.scrambled.split("").join(" ")}*`,
              `◦ Jawaban Benar: *${session.item.kata}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .susunkata untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const cleanAnswer = session.item.kata.toUpperCase().replace(/[^A-Z0-9]/g, "");

      if (cleanInput === cleanAnswer) {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Susunan Benar!", "🎉") +
            "\n\n" +
            bracketBox("🏆", "ʜᴀꜱɪʟ", [
              `◦ Penjawab: *@${(m.sender || "").split("@")[0]}*`,
              `◦ Kata: *${session.item.kata}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Luar biasa! Ketik .susunkata untuk kata selanjutnya."),
        );
        return { handled: true };
      } else {
        await m.reply(
          alyaHeader("Salah!", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ *" ${input} "* belum tepat!`,
              `◦ Coba lagi atau ketik *.susunkata nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = SUSUNKATA_DATA[Math.floor(Math.random() * SUSUNKATA_DATA.length)];
    const scrambled = scrambleWord(item.kata);
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
              bracketBox("⌛", "ʜᴀꜱɪʟ", [
                `◦ Kata Acak: *${scrambled.split("").join(" ")}*`,
                `◦ Jawaban yang Benar: *${item.kata}*`,
                `◦ Petunjuk: *${item.petunjuk}*`,
              ]) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .susunkata untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    sessions.set(chatId, { item, scrambled, timer, endTime });

    await m.reply(
      alyaHeader("Susun Kata", "🧩") +
        "\n\n" +
        bracketBox("❓", "ꜱᴏᴀʟ", [
          `◦ Kata Acak: *${scrambled.split("").join(" ")}*`,
          `◦ Petunjuk: *${item.petunjuk}*`,
          `◦ Waktu: *60 detik*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Susun menjadi kata yang benar! Ketik: .susunkata <jawaban>"),
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
