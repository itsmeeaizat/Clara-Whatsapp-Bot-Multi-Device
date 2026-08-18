import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tebakanime",
  alias: ["tebakanime", "guessanime"],
  category: "game",
  description: "Tebak nama karakter anime berdasarkan petunjuk ciri khasnya",
  usage: ".tebakanime [jawaban/nyerah]",
  example: ".tebakanime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const TEBAKANIME_DATA = [
  { nama: "Monkey D Luffy", anime: "One Piece", petunjuk: "Kapten Bajak Laut Topi Jerami yang tubuhnya lentur seperti karet setelah makan buah Gomu Gomu no Mi." },
  { nama: "Saitama", anime: "One Punch Man", petunjuk: "Pahlawan berrambut botak yang bisa mengalahkan musuh hanya dalam satu pukulan." },
  { nama: "Naruto Uzumaki", anime: "Naruto", petunjuk: "Ninja dari Konoha yang bercita-cita menjadi Hokage dan memiliki Kurama di dalam tubuhnya." },
  { nama: "Son Goku", anime: "Dragon Ball", petunjuk: "Bangsa Saiyan yang dikirim ke Bumi, hobi bertarung, dan jurus utamanya Kamehameha." },
  { nama: "Levi Ackerman", anime: "Attack on Titan", petunjuk: "Kapten pasukan pengintai yang disebut prajurit terkuat kemanusiaan dan terobsesi dengan kebersihan." },
  { nama: "Tanjiro Kamado", anime: "Demon Slayer", petunjuk: "Pembasmi iblis yang membawa adiknya Nezuko di dalam kotak kayu dan menggunakan teknik Pernapasan Air." },
  { nama: "Gojo Satoru", anime: "Jujutsu Kaisen", petunjuk: "Penyihir Jujutsu terkuat berambut putih yang selalu memakai penutup mata hitam." },
  { nama: "Light Yagami", anime: "Death Note", petunjuk: "Siswa jenius yang menemukan buku catatan pencabut nyawa dan memakai nama alias Kira." },
  { nama: "Edward Elric", anime: "Fullmetal Alchemist", petunjuk: "Alchemist termuda yang kehilangan tangan dan kakinya demi menghidupkan ibunya." },
  { nama: "Roronoa Zoro", anime: "One Piece", petunjuk: "Pendekar tiga pedang (Santoryu) dari kelompok Topi Jerami yang sering tersesat." },
  { nama: "Kakashi Hatake", anime: "Naruto", petunjuk: "Ninja peniru berambut perak yang memakai masker dan memiliki mata Sharingan." },
  { nama: "Eren Yeager", anime: "Attack on Titan", petunjuk: "Pemuda yang bersumpah membasmi semua Titan setelah ibunya dimakan Titan." },
  { nama: "Izuku Midoriya", anime: "My Hero Academia", petunjuk: "Pemuda tanpa Quirk yang menerima kekuatan One For All dari All Might." },
  { nama: "Natsu Dragneel", anime: "Fairy Tail", petunjuk: "Penyihir Dragon Slayer Api dari guild Fairy Tail yang gampang mabuk kendaraan." },
  { nama: "Ichigo Kurosaki", anime: "Bleach", petunjuk: "Remaja yang menjadi Shinigami pengganti dan membawa pedang Zanpakuto bernama Zangetsu." },
  { nama: "Killua Zoldyck", anime: "Hunter x Hunter", petunjuk: "Sahabat Gon yang berasal dari keluarga pembunuh bayaran terkenal dan menguasai elemen petir." },
  { nama: "L Lawliet", anime: "Death Note", petunjuk: "Detektif jenius yang suka makan makanan manis dan selalu duduk membungkuk saat menyelidiki kasus." },
  { nama: "Vegeta", anime: "Dragon Ball", petunjuk: "Pangeran bangsa Saiyan yang arogan dan merupakan rival abadi Son Goku." },
  { nama: "Anya Forger", anime: "Spy x Family", petunjuk: "Gadis cilik telepatis yang bisa membaca pikiran orang lain dan sangat menyukai kacang tanah." },
  { nama: "Ken Kaneki", anime: "Tokyo Ghoul", petunjuk: "Mahasiswa yang berubah menjadi setengah Ghoul setelah menerima transplantasi organ Rize." },
  { nama: "Naofumi Iwatani", anime: "The Rising of the Shield Hero", petunjuk: "Pemuda yang dipanggil ke dunia lain sebagai Pahlawan Perisai namun difitnah di awal perjalanannya." },
  { nama: "Megumi Fushiguro", anime: "Jujutsu Kaisen", petunjuk: "Penyihir Jujutsu pengguna teknik Ten Shadows yang dapat memanggil bayangan Shikigami." },
];

global.tebakanime_sessions = global.tebakanime_sessions || new Map();

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.tebakanime_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        await m.reply(
          alyaHeader("Tebak Anime", "🌸") +
            "\n\n" +
            bracketBox("❓", "ᴘᴇᴛᴜɴᴊᴜᴋ", [
              `◦ Anime: *${session.item.anime}*`,
              `◦ Ciri-ciri: *"${session.item.petunjuk}"*`,
              `◦ Waktu tersisa: *${Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))}s*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebakanime <jawaban> atau .tebakanime nyerah"),
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
              `◦ Karakter: *${session.item.nama}*`,
              `◦ Anime: *${session.item.anime}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebakanime untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanAnswer = session.item.nama.toLowerCase().replace(/[^a-z0-9]/g, "");

      const isMatch =
        cleanInput === cleanAnswer ||
        (cleanInput.length >= 3 && (cleanAnswer.includes(cleanInput) || cleanInput.includes(cleanAnswer)));

      if (isMatch) {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Tebakan Tepat!", "🎉") +
            "\n\n" +
            bracketBox("🏆", "ʜᴀꜱɪʟ", [
              `◦ Penjawab: *@${(m.sender || "").split("@")[0]}*`,
              `◦ Karakter: *${session.item.nama}*`,
              `◦ Anime: *${session.item.anime}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Otaku sejati! Ketik .tebakanime untuk tantangan lain."),
        );
        return { handled: true };
      } else {
        await m.reply(
          alyaHeader("Salah!", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ *" ${input} "* bukan karakter yang dimaksud!`,
              `◦ Coba lagi atau ketik *.tebakanime nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = TEBAKANIME_DATA[Math.floor(Math.random() * TEBAKANIME_DATA.length)];
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
                `◦ Karakter: *${item.nama}*`,
                `◦ Anime: *${item.anime}*`,
                `◦ Petunjuk: *${item.petunjuk}*`,
              ]) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .tebakanime untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    sessions.set(chatId, { item, timer, endTime });

    await m.reply(
      alyaHeader("Tebak Anime", "🌸") +
        "\n\n" +
        bracketBox("❓", "ꜱᴏᴀʟ", [
          `◦ Anime: *${item.anime}*`,
          `◦ Petunjuk: *"${item.petunjuk}"*`,
          `◦ Waktu: *60 detik*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Tebak nama karakternya! Ketik: .tebakanime <jawaban>"),
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
