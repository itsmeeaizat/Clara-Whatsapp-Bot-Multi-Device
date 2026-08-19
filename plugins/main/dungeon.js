// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Dungeon — menembus ruang demi ruang
 * ---------------------------------------------------------------
 * Sebelumnya PLACEHOLDER berisi data karangan. Kini pemain benar-
 * benar menembus beberapa ruang berturut-turut; makin dalam makin
 * besar hadiahnya, tetapi HP terus terkuras dan bisa gagal di tengah.
 *
 *   .dungeon            masuk dungeon sesuai level
 *   .dungeon daftar     lihat daftar dungeon
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
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  bar,
  angka,
  labelKelas,
} from "../../src/lib/clara-rpg-core.js";

const BIAYA_STAMINA = 4;

const DUNGEON = [
  {
    nama: "Hutan Berkabut",
    ikon: "🌲",
    lvlMin: 1,
    ruang: 3,
    musuhHp: 70,
    musuhSerang: 12,
    koin: 600,
    exp: 120,
  },
  {
    nama: "Gua Api",
    ikon: "🔥",
    lvlMin: 8,
    ruang: 4,
    musuhHp: 160,
    musuhSerang: 28,
    koin: 1800,
    exp: 320,
  },
  {
    nama: "Istana Es",
    ikon: "❄️",
    lvlMin: 16,
    ruang: 5,
    musuhHp: 320,
    musuhSerang: 50,
    koin: 4500,
    exp: 750,
  },
  {
    nama: "Jurang Kegelapan",
    ikon: "🌑",
    lvlMin: 28,
    ruang: 6,
    musuhHp: 600,
    musuhSerang: 90,
    koin: 12000,
    exp: 1800,
  },
];

/** Pilih dungeon tertinggi yang boleh dimasuki pemain. */
function dungeonUntuk(level) {
  const layak = DUNGEON.filter((d) => d.lvlMin <= level);
  return layak.length ? layak[layak.length - 1] : DUNGEON[0];
}

const pluginConfig = {
  name: "dungeon",
  alias: ["instance", "ruangbawah", "masukdungeon"],
  category: "game",
  description: "Tembus ruang demi ruang dungeon, hadiah dan risiko bertambah",
  usage: ".dungeon [daftar]",
  example: ".dungeon",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const sub = (m.text || "").trim().toLowerCase();
    const p = ambilPemain(db, m.sender);

    if (["daftar", "list", "info"].includes(sub)) {
      const baris = DUNGEON.map(
        (d) =>
          `◦ ${d.ikon} *${d.nama}*\n│     Lv ${d.lvlMin}+ · ${d.ruang} ruang · ${angka(d.koin)} koin` +
          (p.level >= d.lvlMin ? " ✅" : " 🔒"),
      );
      await m.reply(
        alyaHeader("Daftar Dungeon", "🏰") +
          "\n\n" +
          bracketBox("🗺️", "ᴡɪʟᴀʏᴀʜ", baris) +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            `◦ Levelmu: *${p.level}*`,
            `◦ Biaya: *${BIAYA_STAMINA} stamina*`,
            "◦ Dungeon tertinggi yang terbuka otomatis dipilih.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}dungeon untuk masuk`),
      );
      return { handled: true };
    }

    if (p.hp <= 0) {
      await m.reply(
        alyaHeader("Kamu Tumbang", "💀") +
          "\n\n" +
          bracketBox("💀", "ᴋᴏɴᴅɪꜱɪ", [`◦ Pulihkan HP dengan *${prefix}ramuan*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Dungeon terlalu berbahaya saat sekarat"),
      );
      return { handled: true };
    }

    if (p.hp < p.hpMaks * 0.3) {
      await m.reply(
        alyaHeader("HP Terlalu Rendah", "🩸") +
          "\n\n" +
          bracketBox("⚠️", "ᴘᴇʀɪɴɢᴀᴛᴀɴ", [
            `◦ HP: ${bar(p.hp, p.hpMaks, 8)} *${angka(p.hp)}/${angka(p.hpMaks)}*`,
            "◦ Dungeon butuh minimal *30%* HP.",
            `◦ Pakai *${prefix}ramuan* dulu.`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Masuk dungeon dengan HP tipis hanya membuang stamina"),
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
          tipText("Dungeon menguras banyak tenaga"),
      );
      return { handled: true };
    }

    pakaiStamina(db, m.sender, BIAYA_STAMINA);

    const d = dungeonUntuk(p.level);
    const bela = kekuatanBela(p);
    let hp = p.hp;
    const catatan = [];
    let ruangLewat = 0;

    for (let r = 1; r <= d.ruang; r++) {
      let hpMusuh = d.musuhHp + r * 20;
      let ronde = 0;

      while (hpMusuh > 0 && hp > 0 && ronde < 6) {
        ronde++;
        const s = hitungSerangan(p, Math.floor(d.musuhSerang * 0.35));
        hpMusuh -= s.damage;
        if (hpMusuh > 0) {
          const balas = Math.max(
            1,
            Math.floor(d.musuhSerang * (0.7 + Math.random() * 0.5) - bela * 0.4),
          );
          hp = Math.max(0, hp - balas);
        }
      }

      if (hp <= 0) {
        catatan.push(`◦ Ruang ${r}: 💀 *kamu tumbang di sini*`);
        break;
      }
      if (hpMusuh > 0) {
        catatan.push(`◦ Ruang ${r}: 🚪 *mundur, musuh terlalu kuat*`);
        break;
      }

      ruangLewat++;
      catatan.push(`◦ Ruang ${r}: ✅ ditaklukkan (HP ${angka(hp)})`);
    }

    const tuntas = ruangLewat >= d.ruang;
    const porsi = ruangLewat / d.ruang;
    const koin = Math.floor(d.koin * porsi * (tuntas ? 1 : 0.5));
    const exp = Math.floor(d.exp * porsi * (tuntas ? 1 : 0.5));
    const hadiah = beriHadiah(db, m.sender, koin, exp);

    const st = { ...(p.statistik || {}) };
    st.monster = (st.monster || 0) + ruangLewat;
    simpanPemain(db, m.sender, { hp, statistik: st });

    let hadiahBarang = null;
    if (tuntas) {
      hadiahBarang = Math.random() < 0.5 ? "peti_harta" : "kristal";
      tambahBarang(db, m.sender, hadiahBarang, 1);
    }

    const bagian = [
      alyaHeader(tuntas ? "Dungeon Ditaklukkan" : "Keluar dari Dungeon", d.ikon),
      "\n\n",
      bracketBox(d.ikon, "ᴅᴜɴɢᴇᴏɴ", [
        `◦ *${d.nama}* (Lv ${d.lvlMin}+)`,
        `◦ Ruang ditembus: *${ruangLewat}/${d.ruang}*`,
        `◦ ${labelKelas(p.kelas)} Lv${p.level}`,
      ]),
      "\n\n",
      bracketBox("🚪", "ᴄᴀᴛᴀᴛᴀɴ", catatan),
      "\n\n",
      bracketBox("❤️", "ᴋᴏɴᴅɪꜱɪ", [
        `◦ HP: ${bar(hp, p.hpMaks, 8)} *${angka(hp)}/${angka(p.hpMaks)}*`,
      ]),
      "\n\n",
      bracketBox("💰", "ʜᴀᴅɪᴀʜ", [
        `◦ Koin: *+${angka(hadiah.koin)}*`,
        `◦ Exp: *+${angka(hadiah.exp)}*`,
        hadiahBarang ? `◦ Bonus: *${hadiahBarang.replace(/_/g, " ")}*` : null,
        !tuntas ? "◦ _Hadiah dipotong karena tidak tuntas._" : null,
      ].filter(Boolean)),
    ];

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
      separator(),
      "\n",
      tipText(
        tuntas
          ? `${prefix}dungeon daftar untuk melihat wilayah lain`
          : "Perkuat perlengkapan agar bisa menembus lebih dalam",
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
        tipText(`Ketik ${prefix}dungeon untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { DUNGEON, dungeonUntuk };
