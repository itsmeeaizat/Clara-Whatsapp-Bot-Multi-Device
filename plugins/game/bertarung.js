/**
 * Bertarung — melawan monster (PvE)
 * ---------------------------------------------------------------
 * Pertarungan giliran yang disimulasikan penuh, lalu ditampilkan
 * sebagai ringkasan ronde. HP yang terkuras benar-benar tersimpan,
 * jadi pemain perlu memulihkan diri sebelum bertarung lagi.
 *
 *   .bertarung
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
  tambahBarang,
  hitungSerangan,
  kekuatanBela,
  monsterUntukLevel,
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  bar,
  angka,
  labelKelas,
} from "../../src/lib/clara-rpg-core.js";

const BIAYA_STAMINA = 2;
const MAKS_RONDE = 12;

/**
 * Simulasikan pertarungan sampai salah satu tumbang.
 * @returns {{menang:boolean, ronde:Array, hpAkhir:number, hpMonster:number}}
 */
function simulasiTarung(pemain, monster, acakFn = Math.random) {
  let hpPemain = pemain.hp;
  let hpMonster = monster.hp;
  const ronde = [];
  const belaPemain = kekuatanBela(pemain);

  for (let i = 1; i <= MAKS_RONDE && hpPemain > 0 && hpMonster > 0; i++) {
    // Giliran pemain
    const serang = hitungSerangan(pemain, Math.floor(monster.serang * 0.4), acakFn);
    hpMonster = Math.max(0, hpMonster - serang.damage);

    // Giliran monster, bila masih hidup
    let balas = 0;
    if (hpMonster > 0) {
      const variasi = 0.8 + acakFn() * 0.4;
      balas = Math.max(1, Math.floor(monster.serang * variasi - belaPemain * 0.4));
      hpPemain = Math.max(0, hpPemain - balas);
    }

    ronde.push({
      ke: i,
      damage: serang.damage,
      kritis: serang.kritis,
      meleset: serang.meleset,
      balas,
      hpPemain,
      hpMonster,
    });
  }

  return {
    menang: hpMonster <= 0 && hpPemain > 0,
    seri: hpMonster > 0 && hpPemain > 0,
    ronde,
    hpAkhir: hpPemain,
    hpMonster,
  };
}

const pluginConfig = {
  name: "bertarung",
  alias: ["tarung", "laga", "adu", "battlerpg"],
  category: "game",
  description: "Bertarung melawan monster liar, HP dan hasilnya tersimpan",
  usage: ".bertarung",
  example: ".bertarung",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const p = ambilPemain(db, m.sender);

    if (p.hp <= 0) {
      await m.reply(
        alyaHeader("Kamu Tumbang", "💀") +
          "\n\n" +
          bracketBox("💀", "ᴋᴏɴᴅɪꜱɪ", [
            "◦ HP kamu *habis*.",
            `◦ Pulihkan dulu dengan *${prefix}ramuan*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Beli ramuan di toko RPG bila belum punya"),
      );
      return { handled: true };
    }

    if (p.hp < p.hpMaks * 0.15) {
      await m.reply(
        alyaHeader("Terlalu Lemah", "🩸") +
          "\n\n" +
          bracketBox("⚠️", "ᴘᴇʀɪɴɢᴀᴛᴀɴ", [
            `◦ HP: ${bar(p.hp, p.hpMaks, 8)} *${angka(p.hp)}/${angka(p.hpMaks)}*`,
            "◦ Di bawah 15%, terlalu berisiko.",
            `◦ Pakai *${prefix}ramuan* dulu.`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Bertarung dalam kondisi sekarat hanya membuang stamina"),
      );
      return { handled: true };
    }

    if (p.stamina < BIAYA_STAMINA) {
      await m.reply(
        alyaHeader("Stamina Habis", "😮‍💨") +
          "\n\n" +
          bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
            `◦ Punya: *${p.stamina}/${STAMINA_MAKS}*`,
            `◦ Dibutuhkan: *${BIAYA_STAMINA}*`,
            `◦ Pulih +1 dalam *${menitStaminaBerikutnya(p)} menit*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Stamina pulih sendiri seiring waktu"),
      );
      return { handled: true };
    }

    pakaiStamina(db, m.sender, BIAYA_STAMINA);

    const monster = monsterUntukLevel(p.level);
    const hasil = simulasiTarung(p, monster);

    const st = { ...(p.statistik || {}) };
    let hadiah = null;

    if (hasil.menang) {
      const pengali = 1 + Math.max(0, monster.lvl - p.level) * 0.1;
      const koin = Math.floor(monster.koin * pengali * (0.9 + Math.random() * 0.2));
      const exp = Math.floor(monster.exp * pengali);
      hadiah = beriHadiah(db, m.sender, koin, exp);
      st.monster = (st.monster || 0) + 1;
    } else {
      st.kalah = (st.kalah || 0) + 1;
    }

    simpanPemain(db, m.sender, { hp: hasil.hpAkhir, statistik: st });

    // Jarahan sesekali
    let jarahan = null;
    if (hasil.menang && Math.random() < 0.25) {
      const pilihan = ["ramuan", "batu_asah", "kristal"];
      jarahan = pilihan[Math.floor(Math.random() * pilihan.length)];
      tambahBarang(db, m.sender, jarahan, 1);
    }

    // Ringkasan 4 ronde terakhir agar pesan tidak kepanjangan
    const tampilRonde = hasil.ronde.slice(-4).map((r) => {
      const tanda = r.meleset ? "💨 meleset" : r.kritis ? `💥 *${r.damage}* KRITIS` : `⚔️ ${r.damage}`;
      return `◦ R${r.ke}: ${tanda}${r.balas ? ` · terkena ${r.balas}` : ""}`;
    });

    const judul = hasil.menang
      ? "Monster Dikalahkan"
      : hasil.seri
        ? "Pertarungan Imbang"
        : "Kamu Kalah";
    const ikon = hasil.menang ? "🏆" : hasil.seri ? "🤝" : "💀";

    const bagian = [
      alyaHeader(judul, ikon),
      "\n\n",
      bracketBox(monster.ikon, "ᴍᴜꜱᴜʜ", [
        `◦ ${monster.ikon} *${monster.nama}* (Lv ${monster.lvl})`,
        `◦ HP: ${bar(hasil.hpMonster, monster.hp, 8)} *${angka(hasil.hpMonster)}/${angka(monster.hp)}*`,
      ]),
      "\n\n",
      bracketBox("⚔️", "ᴊᴀʟᴀɴɴʏᴀ ᴛᴀʀᴜɴɢ", tampilRonde),
      "\n\n",
      bracketBox("❤️", "ᴋᴏɴᴅɪꜱɪᴍᴜ", [
        `◦ ${labelKelas(p.kelas)} · Lv ${p.level}`,
        `◦ HP: ${bar(hasil.hpAkhir, p.hpMaks, 8)} *${angka(hasil.hpAkhir)}/${angka(p.hpMaks)}*`,
      ]),
    ];

    if (hasil.menang && hadiah) {
      bagian.push(
        "\n\n",
        bracketBox("💰", "ʜᴀᴅɪᴀʜ", [
          `◦ Koin: *+${angka(hadiah.koin)}*`,
          `◦ Exp: *+${angka(hadiah.exp)}*`,
          jarahan ? `◦ Jarahan: *${jarahan.replace(/_/g, " ")}*` : null,
        ].filter(Boolean)),
      );
      if (hadiah.naikLevel) {
        bagian.push(
          "\n\n",
          bracketBox("🎉", "ɴᴀɪᴋ ʟᴇᴠᴇʟ", [
            `◦ Level *${hadiah.levelLama}* → *${hadiah.levelBaru}*`,
            "◦ HP maksimal bertambah!",
          ]),
        );
      }
    } else if (!hasil.seri) {
      bagian.push(
        "\n\n",
        bracketBox("💀", "ᴋᴀʟᴀʜ", [
          "◦ Tidak ada hadiah kali ini.",
          `◦ Pulihkan HP dengan *${prefix}ramuan*`,
        ]),
      );
    }

    bagian.push(
      "\n\n",
      separator(),
      "\n",
      tipText(
        hasil.menang
          ? `${prefix}bertarung lagi, atau ${prefix}raidbos untuk melawan bos`
          : "Tingkatkan senjata dan armor agar lebih kuat",
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
        tipText(`Ketik ${prefix}bertarung untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { simulasiTarung, BIAYA_STAMINA, MAKS_RONDE };
