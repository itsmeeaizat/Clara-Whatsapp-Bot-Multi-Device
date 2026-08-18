import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "siapakahaku",
  alias: ["siapakahaku", "whoami"],
  category: "game",
  description: "Tebak tokoh, pahlawan, atau karakter terkenal berdasarkan petunjuk",
  usage: ".siapakahaku [jawaban/nyerah]",
  example: ".siapakahaku",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const SIAPAKAHAKU_DATA = [
  { petunjuk: "Aku adalah Proklamator Kemerdekaan Indonesia sekaligus Presiden pertama Republik Indonesia.", jawaban: "Soekarno" },
  { petunjuk: "Aku adalah ilmuwan fisika asal Jerman yang merumuskan Teori Relativitas dan rumus E=mc².", jawaban: "Albert Einstein" },
  { petunjuk: "Aku adalah penemu bola lampu pijar yang praktis dan mendirikan perusahaan General Electric.", jawaban: "Thomas Alva Edison" },
  { petunjuk: "Aku adalah pahlawan nasional wanita dari Jepara yang memperjuangkan emansipasi wanita melalui surat Habis Gelap Terbitlah Terang.", jawaban: "R.A. Kartini" },
  { petunjuk: "Aku adalah tokoh fiksi ninja dari Desa Konoha yang memiliki siluman rubah ekor sembilan di dalam tubuhku.", jawaban: "Naruto Uzumaki" },
  { petunjuk: "Aku adalah penemu telepon pertama kali pada tahun 1876.", jawaban: "Alexander Graham Bell" },
  { petunjuk: "Aku adalah pelukis mahakarya Mona Lisa dan perancang konsep helikopter asal Italia.", jawaban: "Leonardo da Vinci" },
  { petunjuk: "Aku adalah astronot pertama di dunia yang berhasil mendarat di Bulan pada tahun 1969.", jawaban: "Neil Armstrong" },
  { petunjuk: "Aku adalah Wakil Presiden pertama Indonesia yang mendampingi Bung Karno.", jawaban: "Mohammad Hatta" },
  { petunjuk: "Aku adalah pahlawan nasional asal Maluku yang gambarnya pernah ada di uang kertas Rp 1.000.", jawaban: "Pattimura" },
  { petunjuk: "Aku adalah komposer musik klasik tuli yang menciptakan karya hebat seperti Symphony No. 9.", jawaban: "Ludwig van Beethoven" },
  { petunjuk: "Aku adalah pengusaha pendiri Microsoft dan salah satu tokoh komputer paling berpengaruh.", jawaban: "Bill Gates" },
  { petunjuk: "Aku adalah ilmuwan penemu hukum gravitasi setelah tertimpa buah apel di bawah pohon.", jawaban: "Isaac Newton" },
  { petunjuk: "Aku adalah superhero berbaju merah-biru yang mendapatkan kekuatan dari gigitan laba-laba radiasi.", jawaban: "Spider-Man" },
  { petunjuk: "Aku adalah pahlawan wanita dari Aceh yang gigih memimpin perang melawan Belanda.", jawaban: "Cut Nyak Dien" },
  { petunjuk: "Aku adalah Presiden Indonesia ke-3 yang dikenal ahli dalam bidang penerbangan dan pembuat pesawat terbang N-250 Gatotkaca.", jawaban: "B.J. Habibie" },
  { petunjuk: "Aku adalah pendiri pergerakan Kepanduan / Pramuka dunia asal Inggris.", jawaban: "Baden Powell" },
  { petunjuk: "Aku adalah tokoh detektif fiksi ciptaan Sir Arthur Conan Doyle yang tinggal di 221B Baker Street.", jawaban: "Sherlock Holmes" },
  { petunjuk: "Aku adalah raja Kerajaan Majapahit yang membawa kerajaan ke puncak kejayaan bersama Mahapatih Gajah Mada.", jawaban: "Hayam Wuruk" },
  { petunjuk: "Aku adalah petinju legendaris kelas berat dunia yang terkenal dengan julukan 'The Greatest'.", jawaban: "Muhammad Ali" },
  { petunjuk: "Aku adalah penjelajah asal Italia yang memimpin pelayaran lintas Samudra Atlantik hingga tiba di benua Amerika pada tahun 1492.", jawaban: "Christopher Columbus" },
  { petunjuk: "Aku adalah Pahlawan Pendidikan Nasional Indonesia yang tanggal lahirnya diperingati sebagai Hari Pendidikan Nasional.", jawaban: "Ki Hajar Dewantara" },
];

global.siapakahaku_sessions = global.siapakahaku_sessions || new Map();

async function handler(m, { sock }) {
  try {
    const chatId = m.chat;
    const input = (m.text || "").trim();
    const sessions = global.siapakahaku_sessions;
    const session = sessions.get(chatId);

    if (session) {
      if (!input) {
        await m.reply(
          alyaHeader("Siapakah Aku?", "🕵️") +
            "\n\n" +
            bracketBox("❓", "ᴘᴇᴛᴜɴᴊᴜᴋ", [
              `◦ *"${session.item.petunjuk}"*`,
              `◦ Waktu tersisa: *${Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))}s*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .siapakahaku <jawaban> atau .siapakahaku nyerah"),
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
              `◦ Petunjuk: *${session.item.petunjuk}*`,
              `◦ Jawaban: *${session.item.jawaban}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ketik .siapakahaku untuk main lagi!"),
        );
        return { handled: true };
      }

      const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanAnswer = session.item.jawaban.toLowerCase().replace(/[^a-z0-9]/g, "");

      const isMatch =
        cleanInput === cleanAnswer ||
        (cleanInput.length >= 4 && (cleanAnswer.includes(cleanInput) || cleanInput.includes(cleanAnswer)));

      if (isMatch) {
        clearTimeout(session.timer);
        sessions.delete(chatId);
        await m.reply(
          alyaHeader("Tebakan Tepat!", "🎉") +
            "\n\n" +
            bracketBox("🏆", "ʜᴀꜱɪʟ", [
              `◦ Penjawab: *@${(m.sender || "").split("@")[0]}*`,
              `◦ Jawaban: *${session.item.jawaban}*`,
              `◦ Petunjuk: *${session.item.petunjuk}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Hebat! Ketik .siapakahaku untuk tebakan berikutnya."),
        );
        return { handled: true };
      } else {
        await m.reply(
          alyaHeader("Salah!", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ *" ${input} "* bukan sosok yang dimaksud!`,
              `◦ Coba lagi atau ketik *.siapakahaku nyerah*`,
            ]),
        );
        return { handled: true };
      }
    }

    const item = SIAPAKAHAKU_DATA[Math.floor(Math.random() * SIAPAKAHAKU_DATA.length)];
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
                `◦ Petunjuk: *${item.petunjuk}*`,
                `◦ Sosok tersebut adalah: *${item.jawaban}*`,
              ]) +
              "\n\n" +
              separator() +
              "\n" +
              tipText("Ketik .siapakahaku untuk mencoba lagi"),
          });
        } catch {}
      }
    }, timeoutMs);

    sessions.set(chatId, { item, timer, endTime });

    await m.reply(
      alyaHeader("Siapakah Aku?", "🕵️") +
        "\n\n" +
        bracketBox("❓", "ᴘᴇᴛᴜɴᴊᴜᴋ", [
          `◦ *"${item.petunjuk}"*`,
          `◦ Waktu: *60 detik*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Jawab dengan: .siapakahaku <jawaban>"),
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
