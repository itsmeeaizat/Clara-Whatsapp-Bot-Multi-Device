/**
 * Countdown
 * ---------------------------------------------------------------
 * Hitung mundur menuju tanggal penting. Sudah berisi preset hari
 * besar Indonesia (Lebaran, Kemerdekaan, Tahun Baru, dsb) dan bisa
 * diberi tanggal sendiri.
 *
 *   .countdown                 daftar hari besar terdekat
 *   .countdown 17/8            hitung mundur ke tanggal itu
 *   .countdown 1/1/2027 Wisuda
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const HARI = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/**
 * Preset hari besar. `bulan` 1-12, `tgl` 1-31.
 * Hari raya Islam bergeser tiap tahun sehingga tidak dimasukkan
 * sebagai preset tetap — dihitung terpisah lewat kalender hijriah.
 */
const PRESET = [
  { nama: "Tahun Baru Masehi", ikon: "🎆", bulan: 1, tgl: 1 },
  { nama: "Hari Kartini", ikon: "👩", bulan: 4, tgl: 21 },
  { nama: "Hari Buruh", ikon: "🛠️", bulan: 5, tgl: 1 },
  { nama: "Hari Pendidikan Nasional", ikon: "📚", bulan: 5, tgl: 2 },
  { nama: "Hari Kebangkitan Nasional", ikon: "🇮🇩", bulan: 5, tgl: 20 },
  { nama: "Hari Lahir Pancasila", ikon: "🦅", bulan: 6, tgl: 1 },
  { nama: "Hari Anak Nasional", ikon: "🧒", bulan: 7, tgl: 23 },
  { nama: "HUT Kemerdekaan RI", ikon: "🇮🇩", bulan: 8, tgl: 17 },
  { nama: "Hari Kesaktian Pancasila", ikon: "🦅", bulan: 10, tgl: 1 },
  { nama: "Hari Sumpah Pemuda", ikon: "🤝", bulan: 10, tgl: 28 },
  { nama: "Hari Pahlawan", ikon: "🎖️", bulan: 11, tgl: 10 },
  { nama: "Hari Guru Nasional", ikon: "👨‍🏫", bulan: 11, tgl: 25 },
  { nama: "Hari Ibu", ikon: "💐", bulan: 12, tgl: 22 },
  { nama: "Natal", ikon: "🎄", bulan: 12, tgl: 25 },
];

/* ------------------------------------------------------------------ */
/* Waktu (semua perhitungan memakai WIB = UTC+7)                       */
/* ------------------------------------------------------------------ */

const WIB_OFFSET = 7 * 3600_000;

/** Timestamp tengah malam WIB pada tanggal tertentu. */
function tengahMalamWib(tahun, bulan, tgl) {
  // 00:00 WIB = 17:00 UTC hari sebelumnya
  return Date.UTC(tahun, bulan - 1, tgl, 0, 0, 0) - WIB_OFFSET;
}

/** Komponen tanggal "sekarang" menurut WIB. */
function sekarangWib(now = Date.now()) {
  const geser = new Date(now + WIB_OFFSET);
  return {
    tahun: geser.getUTCFullYear(),
    bulan: geser.getUTCMonth() + 1,
    tgl: geser.getUTCDate(),
    hari: HARI[geser.getUTCDay()],
  };
}

/** Validasi tanggal kalender sungguhan (menolak 31/2). */
function tanggalValid(tahun, bulan, tgl) {
  if (bulan < 1 || bulan > 12 || tgl < 1 || tgl > 31) return false;
  const d = new Date(Date.UTC(tahun, bulan - 1, tgl));
  return (
    d.getUTCFullYear() === tahun &&
    d.getUTCMonth() === bulan - 1 &&
    d.getUTCDate() === tgl
  );
}

/**
 * Parse "17/8", "17-8-2027", "2027-08-17".
 * Tanpa tahun -> tahun ini, dan bila sudah lewat dipakai tahun depan.
 * @returns {{ts:number, tahun:number, bulan:number, tgl:number}|null}
 */
function parseTanggal(input, now = Date.now()) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const kini = sekarangWib(now);

  let tahun = null;
  let bulan = null;
  let tgl = null;

  const iso = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (iso) {
    tahun = parseInt(iso[1], 10);
    bulan = parseInt(iso[2], 10);
    tgl = parseInt(iso[3], 10);
  } else {
    const lokal = raw.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
    if (!lokal) return null;
    tgl = parseInt(lokal[1], 10);
    bulan = parseInt(lokal[2], 10);
    if (lokal[3]) {
      const t = parseInt(lokal[3], 10);
      tahun = t < 100 ? 2000 + t : t;
    } else {
      tahun = kini.tahun;
    }
  }

  if (!tanggalValid(tahun, bulan, tgl)) return null;
  if (tahun < 1970 || tahun > 2200) return null;

  let ts = tengahMalamWib(tahun, bulan, tgl);
  // Tanpa tahun eksplisit dan sudah lewat -> tahun depan
  const adaTahun = Boolean(iso || raw.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/));
  if (!adaTahun && ts + 86400_000 <= now) {
    tahun += 1;
    if (!tanggalValid(tahun, bulan, tgl)) return null; // 29 Feb non-kabisat
    ts = tengahMalamWib(tahun, bulan, tgl);
  }

  return { ts, tahun, bulan, tgl };
}

/** Selisih hari kalender WIB antara sekarang dan target. */
function selisihHari(ts, now = Date.now()) {
  const a = Math.floor((now + WIB_OFFSET) / 86400_000);
  const b = Math.floor((ts + WIB_OFFSET) / 86400_000);
  return b - a;
}

/** Pecah sisa milidetik jadi hari/jam/menit. */
function rinci(ms) {
  const abs = Math.max(0, ms);
  return {
    hari: Math.floor(abs / 86400_000),
    jam: Math.floor((abs % 86400_000) / 3600_000),
    menit: Math.floor((abs % 3600_000) / 60_000),
  };
}

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function tanggalPanjang(ts) {
  const d = new Date(ts + WIB_OFFSET);
  return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${NAMA_BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Bar progres sederhana dari 0-100%. */
function barProgres(persen, lebar = 12) {
  const isi = Math.max(0, Math.min(lebar, Math.round((persen / 100) * lebar)));
  return "▰".repeat(isi) + "▱".repeat(lebar - isi);
}

/** Daftar preset terdekat dari sekarang, sudah terurut. */
function presetTerdekat(now = Date.now(), jumlah = 6) {
  const kini = sekarangWib(now);
  const hasil = PRESET.map((p) => {
    let tahun = kini.tahun;
    let ts = tengahMalamWib(tahun, p.bulan, p.tgl);
    if (selisihHari(ts, now) < 0) {
      tahun += 1;
      ts = tengahMalamWib(tahun, p.bulan, p.tgl);
    }
    return { ...p, tahun, ts, sisaHari: selisihHari(ts, now) };
  });
  hasil.sort((a, b) => a.ts - b.ts);
  return hasil.slice(0, jumlah);
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "countdown",
  alias: ["hitungmundur", "sisahari", "menuju", "berapahari"],
  category: "info",
  description: "Hitung mundur menuju tanggal penting atau hari besar Indonesia",
  usage: ".countdown [tanggal] [nama acara]",
  example: ".countdown 17/8 HUT RI",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const now = Date.now();

    /* --- tanpa argumen: daftar hari besar terdekat --- */
    if (!args.length) {
      const dekat = presetTerdekat(now, 6);
      const kini = sekarangWib(now);

      const lines = dekat.map((p) => {
        const label =
          p.sisaHari === 0
            ? "*HARI INI* 🎉"
            : p.sisaHari === 1
              ? "*besok*"
              : `*${p.sisaHari} hari* lagi`;
        return `◦ ${p.ikon} ${p.nama}\n│     ${p.tgl}/${p.bulan}/${p.tahun} · ${label}`;
      });

      await m.reply(
        alyaHeader("Hitung Mundur", "⏳") +
          "\n\n" +
          bracketBox("📅", "ʜᴀʀɪ ɪɴɪ", [
            `◦ ${kini.hari}, ${kini.tgl} ${NAMA_BULAN[kini.bulan - 1]} ${kini.tahun}`,
            "◦ Zona waktu: *WIB (UTC+7)*",
          ]) +
          "\n\n" +
          bracketBox("🎯", "ᴛᴇʀᴅᴇᴋᴀᴛ", lines) +
          "\n\n" +
          bracketBox("💡", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
            `◦ *${prefix}countdown 17/8*`,
            `◦ *${prefix}countdown 1/1/2027 Wisuda*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Format tanggal: hari/bulan atau hari/bulan/tahun"),
      );
      return { handled: true };
    }

    /* --- tanggal khusus --- */
    const parsed = parseTanggal(args[0], now);
    if (!parsed) {
      await m.reply(
        alyaHeader("Format Salah", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            "◦ Tanggal tidak dikenali atau tidak ada",
            "  di kalender.",
          ]) +
          "\n\n" +
          bracketBox("📅", "ꜰᴏʀᴍᴀᴛ", [
            "◦ *17/8* — tahun ini / tahun depan",
            "◦ *17/8/2027*",
            "◦ *2027-08-17*",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}countdown tanpa argumen untuk daftar hari besar`),
      );
      return { handled: true };
    }

    const nama = args.slice(1).join(" ").trim().slice(0, 60) || "Acara";
    const sisaMs = parsed.ts - now;
    const sisaHari = selisihHari(parsed.ts, now);
    const r = rinci(sisaMs);

    /* --- sudah lewat --- */
    if (sisaHari < 0) {
      const lewat = rinci(Math.abs(sisaMs));
      await m.reply(
        alyaHeader("Sudah Berlalu", "🕰️") +
          "\n\n" +
          bracketBox("📌", "ᴀᴄᴀʀᴀ", [
            `◦ Nama: *${nama}*`,
            `◦ Tanggal: *${tanggalPanjang(parsed.ts)}*`,
          ]) +
          "\n\n" +
          bracketBox("⏮️", "ꜱᴜᴅᴀʜ ʟᴇᴡᴀᴛ", [
            `◦ *${Math.abs(sisaHari)} hari* yang lalu`,
            `◦ Setara *${lewat.hari} hari ${lewat.jam} jam*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Tambahkan tahun bila ingin tanggal di masa depan"),
      );
      return { handled: true };
    }

    /* --- hari H --- */
    if (sisaHari === 0) {
      await m.reply(
        alyaHeader("Hari Ini!", "🎉") +
          "\n\n" +
          bracketBox("🎊", "ꜱᴇʟᴀᴍᴀᴛ", [
            `◦ *${nama}* jatuh hari ini!`,
            `◦ ${tanggalPanjang(parsed.ts)}`,
          ]) +
          "\n\n" +
          bracketBox("📊", "ᴘʀᴏɢʀᴇꜱ", [`◦ ${barProgres(100)} *100%*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Nikmati harinya 🎈"),
      );
      return { handled: true };
    }

    // Progres dihitung dari 1 tahun sebelum hari H
    const persen = Math.max(0, Math.min(100, ((365 - sisaHari) / 365) * 100));
    const minggu = Math.floor(sisaHari / 7);
    const bulanKira = Math.floor(sisaHari / 30);

    const detail = [`◦ *${sisaHari} hari* lagi`];
    if (bulanKira >= 1) detail.push(`◦ Sekitar *${bulanKira} bulan*`);
    if (minggu >= 1) detail.push(`◦ Sekitar *${minggu} minggu*`);
    detail.push(`◦ Tepatnya *${r.hari}h ${r.jam}j ${r.menit}m*`);

    await m.reply(
      alyaHeader("Hitung Mundur", "⏳") +
        "\n\n" +
        bracketBox("📌", "ᴀᴄᴀʀᴀ", [
          `◦ Nama: *${nama}*`,
          `◦ Tanggal: *${tanggalPanjang(parsed.ts)}*`,
        ]) +
        "\n\n" +
        bracketBox("⏰", "ꜱɪꜱᴀ ᴡᴀᴋᴛᴜ", detail) +
        "\n\n" +
        bracketBox("📊", "ᴘʀᴏɢʀᴇꜱ ꜱᴇᴛᴀʜᴜɴ", [
          `◦ ${barProgres(persen)} *${persen.toFixed(1)}%*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(sisaHari === 1 ? "Besok harinya, siap-siap!" : "Waktu berjalan cepat, manfaatkan"),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Coba ${prefix}countdown 17/8`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export {
  parseTanggal,
  selisihHari,
  presetTerdekat,
  tanggalValid,
  tengahMalamWib,
  sekarangWib,
  barProgres,
  rinci,
  PRESET,
};
