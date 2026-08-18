import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "tebakkata",
  alias: ["tebakkata", "guessword"],
  category: "game",
  description: "Tebak kata berdasarkan huruf yang disembunyikan dan petunjuk",
  usage: ".tebakkata [jawaban/nyerah]",
  example: ".tebakkata",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const TEBAKKATA_DATA = [
  { kata: "MENANAM", petunjuk: "Kegiatan menaruh bibit di tanah agar tumbuh" },
  { kata: "BERENANG", petunjuk: "Olahraga bergerak di dalam air" },
  { kata: "MEMBACA", petunjuk: "Kegiatan memahami isi tulisan atau buku" },
  { kata: "MEMASAK", petunjuk: "Kegiatan menyiapkan dan mengolah makanan" },
  { kata: "BERLARI", petunjuk: "Aktivitas bergerak cepat dengan kaki" },
  { kata: "MENULIS", petunjuk: "Melahirkan pikiran atau perasaan dengan tulisan" },
  { kata: "MELUKIS", petunjuk: "Seni membuat gambar pada kanvas atau kertas" },
  { kata: "MENGGAMBAR", petunjuk: "Aktivitas membentuk citra pada permukaan kertas" },
  { kata: "MENYANYI", petunjuk: "Melantunkan suara dengan nada dan irama" },
  { kata: "MENARI", petunjuk: "Menggerakkan tubuh berirama sesuai musik" },
  { kata: "MENJAHIT", petunjuk: "Merangkai kain dengan benang dan jarum" },
  { kata: "MENDENGARKAN", petunjuk: "Menangkap suara dengan indra pendengaran" },
  { kata: "MENGAJAR", petunjuk: "Memberikan pelajaran kepada murid" },
  { kata: "MEMELIHARA", petunjuk: "Merawat dan menjaga hewan atau tanaman" },
  { kata: "MEMBERSIHKAN", petunjuk: "Membuat sesuatu menjadi tidak kotor" },
  { kata: "MENGHITUNG", petunjuk: "Menentukan jumlah dengan angka" },
  { kata: "MEMPERBAIKI", petunjuk: "Membetulkan barang yang rusak" },
  { kata: "MENGEMUDI", petunjuk: "Mengarahkan dan menjalankan kendaraan" },
  { kata: "MENABUNG", petunjuk: "Menyimpan uang untuk masa depan" },
  { kata: "MEMBAYAR", petunjuk: "Memberikan uang sebagai ganti barang atau jasa" },
  { kata: "PEMANDANGAN", petunjuk: "Hasil penglihatan alam yang indah" },
  { kata: "PERPUSTAKAAN", petunjuk: "Tempat menyimpan dan membaca banyak buku" },
];

global.tebakkata_sessions = global.tebakkata_sessions || new Map();

function maskWord(word) {
  const chars = word.split("");
  const hideCount = Math.max(2, Math.floor(chars.length / 2));
  const hiddenIndices = new Set();

  while (hiddenIndices.size < hideCount) {
    const idx = Math.floor(Math.random() * chars.length);
    if (chars[idx] !== " ") {
      hiddenIndices.add(idx);
    }
  }

  return chars.map((ch, i) => (hiddenIndices.has(i) ? "_" : ch)).join(" ");
}

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.tebakkata_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        await m.reply(
          alyaHeader("Tebak Kata", "🔤") +
            "\n\n" +
            bracketBox("❓", "ꜱᴏᴀʟ", [
              `◦ Pola Kata: *${session.masked}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
              `◦ Waktu tersisa: *${Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))}s*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebakkata <jawaban> atau .tebakkata nyerah"),
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
              `◦ Pola Kata: *${session.masked}*`,
              `◦ Kata Utuh: *${session.item.kata}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .tebakkata untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input.toUpperCase().replace(/[^A-Z]/g, "");
      const cleanAnswer = session.item.kata.toUpperCase().replace(/[^A-Z]/g, "");

      if (cleanInput === cleanAnswer) {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Tebakan Tepat!", "🎉") +
            "\n\n" +
            bracketBox("🏆", "ʜᴀꜱɪʟ", [
              `◦ Penjawab: *@${(m.sender || "").split("@")[0]}*`,
              `◦ Kata Utuh: *${session.item.kata}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Mantap! Ketik .tebakkata untuk tantangan berikutnya."),
        );
        return { handled: true };
      } else {
        await m.reply(
          alyaHeader("Salah!", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ *" ${input} "* tidak sesuai dengan pola kata!`,
              `◦ Coba lagi atau ketik *.tebakkata nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = TEBAKKATA_DATA[Math.floor(Math.random() * TEBAKKATA_DATA.length)];
    const masked = maskWord(item.kata);
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
                `◦ Pola Kata: *${masked}*`,
                `◦ Kata yang Benar: *${item.kata}*`,
                `◦ Petunjuk: *${item.petunjuk}*`,
              ]) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .tebakkata untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    sessions.set(chatId, { item, masked, timer, endTime });

    await m.reply(
      alyaHeader("Tebak Kata", "🔤") +
        "\n\n" +
        bracketBox("❓", "ꜱᴏᴀʟ", [
          `◦ Pola Kata: *${masked}*`,
          `◦ Petunjuk: *${item.petunjuk}*`,
          `◦ Waktu: *60 detik*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Tebak kata utuhnya! Ketik: .tebakkata <jawaban>"),
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
