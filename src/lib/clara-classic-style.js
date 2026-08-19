/**
 * Clara Classic Style — Clean Edition
 * ---------------------------------------------------------------
 * Tetap pakai struktur ╔┈┈「 」 tapi tanpa emoji berlebihan.
 * Lebih clean, lebih modern, tetap rapi.
 */

// Emoji per section — minimal, hanya yang penting
const SECTION_EMOJIS = {};

const CATEGORY_EMOJIS_CLASSIC = {};

const GARIS = "┈".repeat(9);

function blokAtas(judul) {
  return `╔┈┈「 *${judul}* 」`;
}

function blokTengah(judul) {
  return `╠┈┈「 *${judul}* 」`;
}

function blokBawah() {
  return `╚${GARIS}❖`;
}

function barisKosong() {
  return "╎";
}

function baris(label, nilai) {
  if (nilai === undefined || nilai === null || nilai === "") {
    return `╎❏ *${label}*`;
  }
  return `╎❏ *${label}:* ${nilai}`;
}

function barisCmd(teks) {
  return `╎ ${teks}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 0 && h < 5) return "Selamat Subuh";
  if (h >= 5 && h < 11) return "Selamat Pagi";
  if (h >= 11 && h < 15) return "Selamat Siang";
  if (h >= 15 && h < 18) return "Selamat Sore";
  if (h >= 18 && h < 24) return "Selamat Malam";
  return "Halo";
}

function headerBanner(namaBot, namaUser) {
  const greet = getGreeting();
  return [
    `╭──「 *${namaBot}* 」`,
    `│`,
    `│ ${greet}, @${namaUser}`,
    `│ Daftar menu yang tersedia.`,
    `╰─────────────❖`,
    ``,
  ].join("\n");
}

function footerBanner(namaBot, prefix) {
  return [
    ``,
    `╭──「 *Tips* 」`,
    `│ ${prefix}menucat <kategori> untuk detail`,
    `│ ${prefix}modemenu untuk ganti tampilan`,
    `│ ${prefix}owner untuk hubungi owner`,
    `╰─────────────❖`,
    ``,
    `${namaBot} · Multi Device`,
  ].join("\n");
}

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

function blokKategori(namaKategori, commands = [], prefix = ".") {
  const out = [`╔┈「 ${namaKategori} 」`];
  for (const c of commands) out.push(barisCmd(prefix + c));
  out.push(blokBawah());
  return out.join("\n");
}

const READ_MORE = String.fromCharCode(8206).repeat(4001);

function clockString(ms) {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, " H ", m, " M ", s, " S "]
    .map((v) => v.toString().padStart(2, "0"))
    .join("");
}

function getWeton(d = new Date()) {
  return ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
    Math.floor(d / 84600000) % 5
  ];
}

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

function namaHari(d = new Date()) {
  return d.toLocaleDateString("id", { weekday: "long", timeZone: "Asia/Jakarta" });
}

function tanggalLengkap(d = new Date()) {
  return d.toLocaleDateString("id", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

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
  SECTION_EMOJIS,
  CATEGORY_EMOJIS_CLASSIC,
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
  getGreeting,
  headerBanner,
  footerBanner,
  READ_MORE,
  GARIS,
};
