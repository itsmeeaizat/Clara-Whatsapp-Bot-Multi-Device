/**
 * Tambang — menggali bijih untuk koin
 * ---------------------------------------------------------------
 * Permainan solo bertenaga stamina. Semakin dalam menggali, semakin
 * besar hasilnya, tetapi risiko runtuh juga naik.
 *
 *   .tambang            gali biasa (1 stamina)
 *   .tambang dalam      gali dalam (3 stamina, hasil lebih besar)
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  simpanPemain,
  pakaiStamina,
  beriHadiah,
  progresQuest,
  tambahBarang,
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  bar,
  angka,
} from "../../src/lib/clara-rpg-core.js";

/** Bijih yang bisa didapat, `bobot` menentukan kelangkaan. */
const BIJIH = [
  { nama: "Batu Biasa", ikon: "🪨", koin: 15, exp: 3, bobot: 30 },
  { nama: "Bijih Tembaga", ikon: "🟤", koin: 45, exp: 8, bobot: 25 },
  { nama: "Bijih Besi", ikon: "⚙️", koin: 90, exp: 14, bobot: 20 },
  { nama: "Bijih Perak", ikon: "🥈", koin: 180, exp: 25, bobot: 12 },
  { nama: "Bijih Emas", ikon: "🥇", koin: 380, exp: 45, bobot: 8 },
  { nama: "Zamrud", ikon: "💚", koin: 700, exp: 80, bobot: 4 },
  { nama: "Berlian", ikon: "💎", koin: 1500, exp: 150, bobot: 1 },
];

/** Pilih bijih secara acak berbobot. */
function pilihBijih(pengali = 1, acakFn = Math.random) {
  // Menggali dalam menaikkan peluang bijih langka
  const daftar = BIJIH.map((b) => ({
    ...b,
    bobotEfektif: pengali > 1 ? b.bobot / Math.pow(pengali, 0.6) + 2 : b.bobot,
  }));
  const total = daftar.reduce((a, b) => a + b.bobotEfektif, 0);
  let undi = acakFn() * total;
  for (const b of daftar) {
    undi -= b.bobotEfektif;
    if (undi <= 0) return b;
  }
  return daftar[0];
}

const pluginConfig = {
  name: "tambangrpg",
  alias: ["gali", "menggali", "menambang"],
  category: "game",
  description: "Gali bijih dan batu mulia untuk koin dan exp",
  usage: ".tambangrpg [dalam]",
  example: ".tambangrpg dalam",
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
    const dalam = ["dalam", "deep", "jauh"].includes(sub);
    const biaya = dalam ? 3 : 1;

    const p = ambilPemain(db, m.sender);

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
          tipText("Istirahat sebentar, stamina pulih sendiri"),
      );
      return { handled: true };
    }

    pakaiStamina(db, m.sender, biaya);

    /* Menggali dalam berisiko runtuh */
    if (dalam && Math.random() < 0.18) {
      const luka = Math.floor(p.hpMaks * (0.1 + Math.random() * 0.15));
      const hpBaru = Math.max(1, p.hp - luka);
      simpanPemain(db, m.sender, { hp: hpBaru });

      await m.reply(
        alyaHeader("Terowongan Runtuh", "💥") +
          "\n\n" +
          bracketBox("💥", "ᴄᴇʟᴀᴋᴀ", [
            "◦ Batu berjatuhan menimpamu!",
            `◦ HP berkurang: *-${angka(luka)}*`,
            `◦ HP: ${bar(hpBaru, p.hpMaks, 8)} *${angka(hpBaru)}/${angka(p.hpMaks)}*`,
          ]) +
          "\n\n" +
          bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [`◦ Terpakai: *${biaya}* (sia-sia)`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Pulihkan diri dengan ${prefix}ramuan`),
      );
      return { handled: true };
    }

    /* Hasil galian */
    const jumlahGali = dalam ? 2 + Math.floor(Math.random() * 2) : 1;
    const hasil = [];
    let totalKoin = 0;
    let totalExp = 0;

    for (let i = 0; i < jumlahGali; i++) {
      const b = pilihBijih(dalam ? 2 : 1);
      hasil.push(b);
      totalKoin += b.koin;
      totalExp += b.exp;
    }

    // Bonus level: penambang berpengalaman dapat lebih banyak
    const bonus = 1 + p.level * 0.02;
    totalKoin = Math.floor(totalKoin * bonus);
    totalExp = Math.floor(totalExp * bonus);

    const hadiah = beriHadiah(db, m.sender, totalKoin, totalExp);
    const curP = ambilPemain(db, m.sender);
    if (curP.questHarian) progresQuest(curP, "tambang_5x", 1);

    // Peluang kecil menemukan peti harta
    let peti = false;
    if (Math.random() < (dalam ? 0.12 : 0.04)) {
      tambahBarang(db, m.sender, "peti_harta", 1);
      peti = true;
    }

    const barisHasil = hasil.map(
      (b) => `◦ ${b.ikon} *${b.nama}* — ${angka(b.koin)} koin`,
    );

    const sesudah = ambilPemain(db, m.sender);
    const kotak = [
      alyaHeader(dalam ? "Galian Dalam" : "Menambang", "⛏️"),
      "\n\n",
      bracketBox("💎", "ᴛᴇᴍᴜᴀɴ", barisHasil),
      "\n\n",
      bracketBox("💰", "ʜᴀꜱɪʟ", [
        `◦ Koin: *+${angka(hadiah.koin)}*`,
        `◦ Exp: *+${angka(hadiah.exp)}*`,
        p.level > 1 ? `◦ Bonus level: *+${Math.round((bonus - 1) * 100)}%*` : null,
        `◦ Total koin: *${angka(sesudah.koin)}*`,
      ].filter(Boolean)),
    ];

    if (peti) {
      kotak.push(
        "\n\n",
        bracketBox("🎁", "ʙᴇʀᴜɴᴛᴜɴɢ", [
          "◦ Kamu menemukan *Peti Harta*!",
          `◦ Buka dengan *${prefix}buka*`,
        ]),
      );
    }

    if (hadiah.naikLevel) {
      kotak.push(
        "\n\n",
        bracketBox("🎉", "ɴᴀɪᴋ ʟᴇᴠᴇʟ", [
          `◦ Level *${hadiah.levelLama}* → *${hadiah.levelBaru}*`,
          "◦ HP maksimal ikut bertambah!",
        ]),
      );
    }

    kotak.push(
      "\n\n",
      bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
        `◦ Sisa: *${sesudah.stamina}/${STAMINA_MAKS}* (terpakai ${biaya})`,
      ]),
      "\n\n",
      separator(),
      "\n",
      tipText(dalam ? "Galian dalam berisiko runtuh, tapi hasilnya besar" : `Coba ${prefix}tambangrpg dalam untuk hasil lebih besar`),
    );

    await m.reply(kotak.join(""));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}tambangrpg untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { BIJIH, pilihBijih };
