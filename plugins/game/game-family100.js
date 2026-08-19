// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "family100",
  alias: ["family100", "f100"],
  category: "game",
  description: "Kuis survei Family 100 dengan menebak jawaban teratas",
  usage: ".family100 [jawaban/nyerah]",
  example: ".family100",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const FAMILY100_DATA = [
  {
    soal: "Sebutkan hal yang sering dilakukan orang saat bangun tidur!",
    jawaban: [
      { teks: "Cek HP", poin: 35 },
      { teks: "Mandi", poin: 25 },
      { teks: "Minum Air", poin: 15 },
      { teks: "Sholat", poin: 15 },
      { teks: "Merapikan Tempat Tidur", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan makanan yang biasa dimakan saat sarapan!",
    jawaban: [
      { teks: "Nasi Goreng", poin: 30 },
      { teks: "Roti", poin: 25 },
      { teks: "Bubur Ayam", poin: 20 },
      { teks: "Nasi Uduk", poin: 15 },
      { teks: "Mie Instant", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan alasan orang terlambat datang ke kantor atau sekolah!",
    jawaban: [
      { teks: "Macet", poin: 40 },
      { teks: "Kesiangan", poin: 30 },
      { teks: "Hujan", poin: 15 },
      { teks: "Ban Bocor", poin: 10 },
      { teks: "Ketinggalan Bus", poin: 5 },
    ],
  },
  {
    soal: "Sebutkan hal yang sering dicari saat barangnya hilang di rumah!",
    jawaban: [
      { teks: "Kunci", poin: 35 },
      { teks: "Handphone", poin: 30 },
      { teks: "Dompet", poin: 20 },
      { teks: "Remote TV", poin: 10 },
      { teks: "Kacamata", poin: 5 },
    ],
  },
  {
    soal: "Sebutkan hobi yang sering dilakukan orang saat akhir pekan!",
    jawaban: [
      { teks: "Nonton Film", poin: 30 },
      { teks: "Olahraga", poin: 25 },
      { teks: "Jalan jalan", poin: 20 },
      { teks: "Tidur", poin: 15 },
      { teks: "Memasak", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan buah yang sering dijadikan jus atau es buah!",
    jawaban: [
      { teks: "Alpukat", poin: 30 },
      { teks: "Mangga", poin: 25 },
      { teks: "Jeruk", poin: 20 },
      { teks: "Melon", poin: 15 },
      { teks: "Naga", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan benda yang selalu ada di dalam dompet!",
    jawaban: [
      { teks: "Uang", poin: 40 },
      { teks: "KTP", poin: 25 },
      { teks: "Kartu ATM", poin: 20 },
      { teks: "Foto", poin: 10 },
      { teks: "STNK", poin: 5 },
    ],
  },
  {
    soal: "Sebutkan hewan yang sering dipelihara di rumah!",
    jawaban: [
      { teks: "Kucing", poin: 35 },
      { teks: "Anjing", poin: 25 },
      { teks: "Ikan", poin: 20 },
      { teks: "Burung", poin: 15 },
      { teks: "Kelinci", poin: 5 },
    ],
  },
  {
    soal: "Sebutkan alasan orang menyalakan AC atau kipas angin!",
    jawaban: [
      { teks: "Panas", poin: 50 },
      { teks: "Gerah", poin: 25 },
      { teks: "Mengusir Nyamuk", poin: 15 },
      { teks: "Biar Tidur Nyenyak", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan barang yang dibawa saat pergi ke pantai!",
    jawaban: [
      { teks: "Kacamata Hitam", poin: 30 },
      { teks: "Baju Ganti", poin: 25 },
      { teks: "Handuk", poin: 20 },
      { teks: "Sunscreen", poin: 15 },
      { teks: "Kamera", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan kegiatan yang dilakukan saat merasa bosan!",
    jawaban: [
      { teks: "Main HP", poin: 40 },
      { teks: "Mendengarkan Musik", poin: 25 },
      { teks: "Tidur", poin: 20 },
      { teks: "Makan", poin: 10 },
      { teks: "Jalan jalan", poin: 5 },
    ],
  },
  {
    soal: "Sebutkan minuman dingin yang populer saat cuaca panas!",
    jawaban: [
      { teks: "Es Teh", poin: 40 },
      { teks: "Es Jeruk", poin: 25 },
      { teks: "Es Kelapa", poin: 20 },
      { teks: "Jus Buah", poin: 10 },
      { teks: "Boba", poin: 5 },
    ],
  },
  {
    soal: "Sebutkan jenis kendaraan yang sering digunakan sehari-hari!",
    jawaban: [
      { teks: "Motor", poin: 45 },
      { teks: "Mobil", poin: 30 },
      { teks: "Bus", poin: 15 },
      { teks: "Sepeda", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan perlengkapan sekolah yang dibawa di dalam tas!",
    jawaban: [
      { teks: "Buku", poin: 35 },
      { teks: "Pulpen", poin: 30 },
      { teks: "Pensil", poin: 15 },
      { teks: "Penggaris", poin: 10 },
      { teks: "Kotak Pensil", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan olahraga populer yang sering ditonton di TV!",
    jawaban: [
      { teks: "Sepak Bola", poin: 45 },
      { teks: "Bulu Tangkis", poin: 30 },
      { teks: "Bola Basket", poin: 15 },
      { teks: "Voli", poin: 10 },
    ],
  },
  {
    soal: "Sebutkan bumbu dapur yang hampir selalu ada saat memasak!",
    jawaban: [
      { teks: "Bawang Merah", poin: 35 },
      { teks: "Bawang Putih", poin: 30 },
      { teks: "Garam", poin: 20 },
      { teks: "Cabai", poin: 15 },
    ],
  },
];

global.family100_sessions = global.family100_sessions || new Map();

function buildBoardLines(session) {
  return session.answers.map((item, idx) => {
    if (item.guessed) {
      return `${idx + 1}. ✅ *${item.teks}* (${item.poin} pt) — *@${item.guessedBy}*`;
    }
    return `${idx + 1}. 👤 ______________________ [??]`;
  });
}

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.family100_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        const board = buildBoardLines(session);
        await m.reply(
          alyaHeader("Family 100", "🎯") +
            "\n\n" +
            bracketBox("❓", session.soal, board) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .family100 <jawaban> atau .family100 nyerah"),
        );
        return { handled: true };
      }

      if (input.toLowerCase() === "nyerah" || input.toLowerCase() === "pass") {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        const revealed = session.answers.map(
          (ans, i) => `${i + 1}. *${ans.teks}* (${ans.poin} pt)`,
        );
        await m.reply(
          alyaHeader("Menyerah", "🏳️") +
            "\n\n" +
            bracketBox("💡", "ᴊᴀᴡᴀʙᴀɴ ʟᴇɴɢᴋᴀᴘ", revealed) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .family100 untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");
      let foundIndex = -1;

      for (let i = 0; i < session.answers.length; i++) {
        const cleanAnswer = session.answers[i].teks
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        if (cleanInput === cleanAnswer || cleanAnswer.includes(cleanInput) || cleanInput.includes(cleanAnswer)) {
          if (cleanInput.length >= 3) {
            foundIndex = i;
            break;
          }
        }
      }

      if (foundIndex !== -1) {
        const target = session.answers[foundIndex];
        if (target.guessed) {
          await m.reply(
            alyaHeader("Sudah Ditebak", "⚠️") +
              "\n\n" +
              bracketBox("⚠️", "ɪɴꜰᴏ", [
                `◦ Jawaban *"${target.teks}"* sudah ditebak oleh *@${target.guessedBy}*!`,
              ]),
          );
          return { handled: true };
        }

        const senderUsername = (m.sender || "").split("@")[0];
        target.guessed = true;
        target.guessedBy = senderUsername;

        const isWin = session.answers.every((a) => a.guessed);

        if (isWin) {
          clearTimeout(session.timer);
          sessions.delete(chatId);
          const finalBoard = buildBoardLines(session);
          await m.reply(
            alyaHeader("Sempurna! Semua Ditebak", "🏆") +
              "\n\n" +
              bracketBox("🎯", session.soal, finalBoard) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Semua jawaban berhasil ditemukan! Ketik .family100 untuk ronde baru."),
          );
          return { handled: true };
        } else {
          const currentBoard = buildBoardLines(session);
          await m.reply(
            alyaHeader("Jawaban Tepat!", "✅") +
              "\n\n" +
              bracketBox("🎯", session.soal, currentBoard) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Tebak jawaban lainnya! Ketik .family100 <jawaban>"),
          );
          return { handled: true };
        }
      } else {
        await m.reply(
          alyaHeader("Salah / Tidak Ada", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Jawaban *"${input}"* tidak ada dalam survei.`,
              `◦ Coba tebakan lain atau ketik *.family100 nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = FAMILY100_DATA[Math.floor(Math.random() * FAMILY100_DATA.length)];
    const answers = item.jawaban.map((a) => ({
      teks: a.teks,
      poin: a.poin,
      guessed: false,
      guessedBy: "",
    }));

    const timeoutMs = 90000;
    const endTime = Date.now() + timeoutMs;

    const timer = setTimeout(async () => {
      if (sessions.has(chatId)) {
        sessions.delete(chatId);
        try {
          const revealAll = answers.map(
            (ans, i) => `${i + 1}. *${ans.teks}* (${ans.poin} pt)${ans.guessed ? ` — @${ans.guessedBy}` : ""}`,
          );
          await sock.sendMessage(chatId, {
            text:
              alyaHeader("Waktu Habis", "⏰") +
              "\n\n" +
              bracketBox("⌛", "ʜᴀꜱɪʟ ꜱᴜʀᴠᴇɪ", revealAll) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .family100 untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    const newSession = {
      soal: item.soal,
      answers,
      timer,
      endTime,
    };

    sessions.set(chatId, newSession);

    const board = buildBoardLines(newSession);
    await m.reply(
      alyaHeader("Family 100", "🎯") +
        "\n\n" +
        bracketBox("❓", item.soal, board) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Jawab dengan: .family100 <jawaban> (Waktu: 90s)"),
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
