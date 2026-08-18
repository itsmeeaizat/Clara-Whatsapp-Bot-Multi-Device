/**
 * Clara Classic Style
 * ---------------------------------------------------------------
 * Tampilan menu bergaya Clara-MD orisinal (Zeltoria, 2023) yang sudah
 * tidak dikembangkan lagi. Repo ini melanjutkannya, jadi tampilan menunya
 * disamakan dengan yang lama supaya pengguna lama tetap familier.
 *
 * Bentuk asli yang ditiru:
 *
 *   ╔┈┈「 *Info User* 」
 *   ╎
 *   ╎❏ *Nama:*  Budi
 *   ╎❏ *Nomor:* @628xxx
 *   ╠┈┈「 *Info Hari* 」
 *   ╎❏ *Waktu:* 14:03:22
 *   ╚┈┈┈┈┈┈┈┈┈❖
 *
 *   ╔┈「 Main 」
 *   ╎ぎ .menu
 *   ╚┈┈┈┈┈┈┈┈┈❖
 *
 * Karakter kunci: ╔ ╠ ╚ ╎ ❏ ❖ ぎ ┈ dan pembungkus 「 」
 */

/* ------------------------------------------------------------------ */
/* Primitif                                                            */
/* ------------------------------------------------------------------ */

const GARIS = "┈".repeat(9);

/** Baris pembuka blok: ╔┈┈「 *Judul* 」 */
function blokAtas(judul) {
  return `╔┈┈「 *${judul}* 」`;
}

/** Baris pemisah antar-bagian dalam satu blok: ╠┈┈「 *Judul* 」 */
function blokTengah(judul) {
  return `╠┈┈「 *${judul}* 」`;
}

/** Baris penutup blok: ╚┈┈┈┈┈┈┈┈┈❖ */
function blokBawah() {
  return `╚${GARIS}❖`;
}

/** Baris kosong berhias: ╎ */
function barisKosong() {
  return "╎";
}

/** Baris isi: ╎❏ *Label:* nilai */
function baris(label, nilai) {
  if (nilai === undefined || nilai === null || nilai === "") {
    return `╎❏ *${label}*`;
  }
  return `╎❏ *${label}:* ${nilai}`;
}

/** Baris command bergaya klasik: ╎ぎ .menu */
function barisCmd(teks) {
  return `╎ぎ ${teks}`;
}

/* ------------------------------------------------------------------ */
/* Blok siap pakai                                                     */
/* ------------------------------------------------------------------ */

/**
 * Susun satu blok utuh dari beberapa bagian.
 * @param {Array<{judul:string, baris:string[]}>} bagian
 * @param {boolean} spasiAwal - sisipkan baris ╎ setelah judul pertama
 */
function blok(bagian = [], spasiAwal = true) {
  const out = [];
  bagian.forEach((b, i) => {
    out.push(i === 0 ? blokAtas(b.judul) : blokTengah(b.judul));
    if (i === 0 && spasiAwal) out.push(barisKosong());
    for (const isi of b.baris || []) out.push(isi);
  });
  out.push(blokBawah());
  return out.join("\n");
}

/**
 * Blok kategori command:
 *   ╔┈「 Main 」
 *   ╎ぎ .menu
 *   ╚┈┈┈┈┈┈┈┈┈❖
 *
 * Perhatikan header kategori memakai DUA ┈ lebih pendek (╔┈「) sesuai aslinya.
 */
function blokKategori(namaKategori, commands = [], prefix = ".") {
  const out = [`╔┈「 ${namaKategori} 」`];
  for (const c of commands) out.push(barisCmd(`${prefix}${c}`));
  out.push(blokBawah());
  return out.join("\n");
}

/* ------------------------------------------------------------------ */
/* Utilitas tampilan                                                   */
/* ------------------------------------------------------------------ */

/**
 * readMore ala Clara lama — memakai karakter LEFT-TO-RIGHT MARK berulang
 * supaya WhatsApp memunculkan tombol "Baca selengkapnya".
 */
const READ_MORE = String.fromCharCode(8206).repeat(4001);

/** Format durasi ala Clara lama: "01 H 23 M 45 S " */
function clockString(ms) {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, " H ", m, " M ", s, " S "]
    .map((v) => v.toString().padStart(2, "0"))
    .join("");
}

/** Weton Jawa, persis rumus Clara lama. */
function getWeton(d = new Date()) {
  return ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
    Math.floor(d / 84600000) % 5
  ];
}

/** Tanggal Hijriah dalam bahasa Indonesia. */
function tanggalIslam(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("id-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

/** Nama hari dalam bahasa Indonesia. */
function namaHari(d = new Date()) {
  return d.toLocaleDateString("id", { weekday: "long", timeZone: "Asia/Jakarta" });
}

/** Tanggal lengkap bahasa Indonesia. */
function tanggalLengkap(d = new Date()) {
  return d.toLocaleDateString("id", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/**
 * Jam WIB HH:mm:ss
 * Catatan: locale "id" memformat jam dengan TITIK (08.44.02), sedangkan
 * Clara lama memakai moment.format("HH:mm:ss") yang memakai TITIK DUA.
 * Pakai en-GB agar hasilnya sama persis dengan aslinya.
 */
function jamWib(d = new Date()) {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

export {
  blok,
  blokAtas,
  blokTengah,
  blokBawah,
  blokKategori,
  baris,
  barisCmd,
  barisKosong,
  clockString,
  getWeton,
  tanggalIslam,
  namaHari,
  tanggalLengkap,
  jamWib,
  READ_MORE,
  GARIS,
};
