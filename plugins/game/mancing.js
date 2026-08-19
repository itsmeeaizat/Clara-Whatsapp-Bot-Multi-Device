// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Mancing — memancing ikan
 * ---------------------------------------------------------------
 * Permainan santai bertenaga stamina. Ikan langka bernilai tinggi,
 * dan sesekali kail menarik benda tak terduga.
 *
 *   .mancing            memancing di danau
 *   .mancing laut       memancing di laut (2 stamina, ikan besar)
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  pakaiStamina,
  beriHadiah,
  progresQuest,
  tambahBarang,
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const IKAN_DANAU = [
  { nama: "Sepatu Bekas", ikon: "👞", koin: 5, exp: 1, bobot: 12, sampah: true },
  { nama: "Ikan Teri", ikon: "🐟", koin: 25, exp: 5, bobot: 28 },
  { nama: "Ikan Mas", ikon: "🐠", koin: 60, exp: 12, bobot: 24 },
  { nama: "Lele", ikon: "🐡", koin: 110, exp: 20, bobot: 18 },
  { nama: "Gurame", ikon: "🎣", koin: 220, exp: 35, bobot: 12 },
  { nama: "Arwana", ikon: "🐉", koin: 650, exp: 90, bobot: 5 },
  { nama: "Ikan Emas Legendaris", ikon: "🌟", koin: 1800, exp: 200, bobot: 1 },
];

const IKAN_LAUT = [
  { nama: "Sampah Plastik", ikon: "🗑️", koin: 3, exp: 1, bobot: 10, sampah: true },
  { nama: "Cumi-cumi", ikon: "🦑", koin: 80, exp: 15, bobot: 24 },
  { nama: "Kepiting", ikon: "🦀", koin: 150, exp: 25, bobot: 22 },
  { nama: "Tuna", ikon: "🐟", koin: 300, exp: 50, bobot: 18 },
  { nama: "Hiu Kecil", ikon: "🦈", koin: 750, exp: 110, bobot: 10 },
  { nama: "Paus Biru", ikon: "🐋", koin: 2000, exp: 260, bobot: 4 },
  { nama: "Kraken", ikon: "🐙", koin: 5000, exp: 600, bobot: 1 },
];

/** Undian berbobot. */
function undi(daftar, acakFn = Math.random) {
  const total = daftar.reduce((a, b) => a + b.bobot, 0);
  let n = acakFn() * total;
  for (const item of daftar) {
    n -= item.bobot;
    if (n <= 0) return item;
  }
  return daftar[0];
}

const pluginConfig = {
  name: "mancing",
  alias: ["fishing", "pancing", "memancing"],
  category: "game",
  description: "Memancing ikan di danau atau laut untuk koin dan exp",
  usage: ".mancing [laut]",
  example: ".mancing laut",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const sub = (m.text || "").trim().toLowerCase();
    const diLaut = ["laut", "sea", "samudra"].includes(sub);
    const biaya = diLaut ? 2 : 1;

    const p = ambilPemain(db, m.sender);

    if (diLaut && p.level < 5) {
      await m.reply(
        alyaHeader("Belum Siap Melaut", "⛵") +
          "\n\n" +
          bracketBox("⚠️", "ꜱʏᴀʀᴀᴛ", [
            "◦ Laut butuh *level 5*.",
            `◦ Level kamu sekarang: *${p.level}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Berlatih dulu dengan ${prefix}mancing di danau`),
      );
      return { handled: true };
    }

    if (p.stamina < biaya) {
      await m.reply(
        alyaHeader("Stamina Habis", "😮‍💨") +
          "\n\n" +
          bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
            `◦ Punya: *${p.stamina}/${STAMINA_MAKS}*`,
            `◦ Dibutuhkan: *${biaya}*`,
            `◦ Pulih +1 dalam *${menitStaminaBerikutnya(p)} menit*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Stamina pulih sendiri seiring waktu"),
      );
      return { handled: true };
    }

    pakaiStamina(db, m.sender, biaya);

    /* Kail bisa lolos */
    if (Math.random() < 0.12) {
      await m.reply(
        alyaHeader("Lolos!", "🎣") +
          "\n\n" +
          bracketBox("💨", "ꜱᴀʏᴀɴɢ ꜱᴇᴋᴀʟɪ", [
            "◦ Ikan menarik kail lalu lepas.",
            "◦ Tidak ada hasil kali ini.",
          ]) +
          "\n\n" +
          bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [`◦ Terpakai: *${biaya}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Sabar, pemancing sejati tidak menyerah"),
      );
      return { handled: true };
    }

    const kolam = diLaut ? IKAN_LAUT : IKAN_DANAU;
    const tangkapan = undi(kolam);

    const bonus = 1 + p.level * 0.02;
    const koin = Math.floor(tangkapan.koin * bonus);
    const exp = Math.floor(tangkapan.exp * bonus);
    const hadiah = beriHadiah(db, m.sender, koin, exp);
    const curP = ambilPemain(db, m.sender);
    if (curP.questHarian) progresQuest(curP, "mancing_3x", 1);

    // Berat ikan sekadar hiasan cerita
    const berat = tangkapan.sampah
      ? null
      : (0.3 + Math.random() * (diLaut ? 40 : 6)).toFixed(1);

    let peti = false;
    if (!tangkapan.sampah && Math.random() < 0.05) {
      tambahBarang(db, m.sender, "peti_harta", 1);
      peti = true;
    }

    const sesudah = ambilPemain(db, m.sender);
    const bagian = [
      alyaHeader(diLaut ? "Mancing di Laut" : "Mancing di Danau", "🎣"),
      "\n\n",
      bracketBox(tangkapan.sampah ? "🗑️" : "🐟", "ᴛᴀɴɢᴋᴀᴘᴀɴ", [
        `◦ ${tangkapan.ikon} *${tangkapan.nama}*`,
        berat ? `◦ Berat: *${berat} kg*` : "◦ Bukan ikan, tapi lumayan...",
      ]),
      "\n\n",
      bracketBox("💰", "ʜᴀꜱɪʟ", [
        `◦ Koin: *+${angka(hadiah.koin)}*`,
        `◦ Exp: *+${angka(hadiah.exp)}*`,
        `◦ Total koin: *${angka(sesudah.koin)}*`,
      ]),
    ];

    if (peti) {
      bagian.push(
        "\n\n",
        bracketBox("🎁", "ʙᴇʀᴜɴᴛᴜɴɢ", [
          "◦ Ada *Peti Harta* tersangkut di kail!",
          `◦ Buka dengan *${prefix}buka*`,
        ]),
      );
    }

    if (hadiah.naikLevel) {
      bagian.push(
        "\n\n",
        bracketBox("🎉", "ɴᴀɪᴋ ʟᴇᴠᴇʟ", [
          `◦ Level *${hadiah.levelLama}* → *${hadiah.levelBaru}*`,
        ]),
      );
    }

    bagian.push(
      "\n\n",
      bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
        `◦ Sisa: *${sesudah.stamina}/${STAMINA_MAKS}* (terpakai ${biaya})`,
      ]),
      "\n\n",
      separator(),
      "\n",
      tipText(
        diLaut
          ? "Kraken sangat langka, tapi bayarannya luar biasa"
          : p.level >= 5
            ? `Coba ${prefix}mancing laut untuk ikan besar`
            : "Naik ke level 5 untuk membuka laut",
      ),
    );

    await m.reply(bagian.join(""));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}mancing untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { IKAN_DANAU, IKAN_LAUT, undi };
