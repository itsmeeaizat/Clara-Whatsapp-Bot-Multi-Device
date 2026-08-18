import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "caklontong",
  alias: ["caklontong"],
  category: "game",
  description: "Kuis Cak Lontong dengan teka-teki lucu dan jawaban terbalik/nyeleneh",
  usage: ".caklontong [jawaban/nyerah]",
  example: ".caklontong",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const CAKLONTONG_DATA = [
  { soal: "Makan di luar rumah pakai...", jawaban: "SENDOK", keterangan: "Kalau tidak pakai sendok, makannya pakai apa dong?" },
  { soal: "Yang membantu dokter di rumah sakit...", jawaban: "SEMBUH", keterangan: "Yang membantu dokter kan pasien yang ingin sembuh!" },
  { soal: "Bantal kotor harus...", jawaban: "DICUCI", keterangan: "Masa bantal kotor didiamkan saja." },
  { soal: "Supaya bersih kita harus...", jawaban: "MANDI", keterangan: "Kalau gak mandi ya kotor dong." },
  { soal: "Burung terbang menggunakan...", jawaban: "SEMANGAT", keterangan: "Kalau gak ada semangat ya gak bakal terbang." },
  { soal: "Pintu rumah biasanya dibuat dari...", jawaban: "SENGAJA", keterangan: "Pintu rumah dibuat sengaja biar bisa masuk dan keluar." },
  { soal: "Padi dipotong dengan...", jawaban: "MINTA", keterangan: "Kalau potong padi punya tetangga harus minta izin dulu." },
  { soal: "Bendera Indonesia warnanya...", jawaban: "MERAHPUTIH", keterangan: "Merah di atas dan putih di bawah." },
  { soal: "Pengendara motor wajib memakai...", jawaban: "HELM", keterangan: "Gunakan helm demi keselamatan bertiga... eh berkendara!" },
  { soal: "Singa adalah hewan yang suka makan...", jawaban: "BANYAK", keterangan: "Singa kan hewan besar, jadinya makan banyak." },
  { soal: "Lampu lalu lintas warna hijau artinya...", jawaban: "JALAN", keterangan: "Hijau artinya jalan terus." },
  { soal: "Orang yang memimpin sebuah negara dinamakan...", jawaban: "PRESIDEN", keterangan: "Sesuai dengan sistem pemerintahan." },
  { soal: "Sebelum minum obat kita harus...", jawaban: "BUKA", keterangan: "Kalau bungkus obatnya tidak dibuka, gimana cara minumnya?" },
  { soal: "Orang ngantuk biasanya...", jawaban: "TIDUR", keterangan: "Kalau ngantuk ya tidur, bukan push rank!" },
  { soal: "Kelinci suka makan...", jawaban: "WORTEL", keterangan: "Wortel sehat untuk mata kelinci." },
  { soal: "Pakaian basah harus...", jawaban: "DIJEMUR", keterangan: "Supaya kering terjemur matahari." },
  { soal: "Air es kalau didiamkan di tempat terbuka akan...", jawaban: "CAIR", keterangan: "Karena suhunya naik." },
  { soal: "Nasi goreng rasanya...", jawaban: "ENAK", keterangan: "Apalagi kalau dimakan saat lapar." },
  { soal: "Mobil tidak bisa jalan kalau tidak ada...", jawaban: "RODA", keterangan: "Tanpa roda mau jalan pakai apa?" },
  { soal: "Ayam bertelur di...", jawaban: "KANDANG", keterangan: "Masa ayam bertelur di kasur?" },
  { soal: "Sebelum makan kita harus...", jawaban: "BERDOA", keterangan: "Berdoa dulu biar berkah." },
  { soal: "Orang sakit biasanya dirawat di...", jawaban: "RUMAHSAKIT", keterangan: "Agar mendapat perawatan medis." },
];

global.caklontong_sessions = global.caklontong_sessions || new Map();

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.caklontong_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        await m.reply(
          alyaHeader("Cak Lontong", "💡") +
            "\n\n" +
            bracketBox("❓", "ꜱᴏᴀʟ", [
              `◦ *${session.item.soal}*`,
              `◦ Waktu tersisa: *${Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))}s*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .caklontong <jawaban> atau .caklontong nyerah"),
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
              `◦ Soal: *${session.item.soal}*`,
              `◦ Jawaban: *${session.item.jawaban}*`,
              `◦ Keterangan: *${session.item.keterangan}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .caklontong untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanAnswer = session.item.jawaban.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (cleanInput === cleanAnswer) {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Jawaban Benar!", "🎉") +
            "\n\n" +
            bracketBox("🏆", "ʜᴀꜱɪʟ", [
              `◦ Penjawab: *@${(m.sender || "").split("@")[0]}*`,
              `◦ Jawaban: *${session.item.jawaban}*`,
              `◦ Keterangan: *${session.item.keterangan}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Selamat! Ketik .caklontong untuk soal berikutnya."),
        );
        return { handled: true };
      } else {
        await m.reply(
          alyaHeader("Salah!", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Jawaban *"${input}"* kurang tepat!`,
              `◦ Coba lagi atau ketik *.caklontong nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = CAKLONTONG_DATA[Math.floor(Math.random() * CAKLONTONG_DATA.length)];
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
                `◦ Soal: *${item.soal}*`,
                `◦ Jawaban: *${item.jawaban}*`,
                `◦ Keterangan: *${item.keterangan}*`,
              ]) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .caklontong untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    sessions.set(chatId, { item, timer, endTime });

    await m.reply(
      alyaHeader("Kuis Cak Lontong", "💡") +
        "\n\n" +
        bracketBox("❓", "ꜱᴏᴀʟ", [
          `◦ *${item.soal}*`,
          `◦ Waktu: *60 detik*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Jawab dengan: .caklontong <jawaban>"),
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
