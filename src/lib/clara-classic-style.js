/**
 * Clara Classic Style — Enhanced
 * ---------------------------------------------------------------
 * Tampilan menu bergaya Clara-MD orisinal (Zeltoria, 2023) yang sudah
 * tidak dikembangkan lagi. Repo ini melanjutkannya.
 *
 * Versi enhanced: tetap pakai ╔┈┈「 」 tapi dengan:
 *  - Emoji per section header
 *  - Greeting dinamis di bagian atas
 *  - Footer decorative dengan bot name
 *  - Spasi yang lebih rapi
 *
 * Bentuk yang ditiru (dengan sentuhan):
 *
 *   ╔┈┈「 👤 *Info User* 」
 *   ╎
 *   ╎❏ *Nama:*  Budi
 *   ╎❏ *Nomor:* @628xxx
 *   ╠┈┈「 📅 *Info Hari* 」
 *   ╎❏ *Waktu:* 14:03:22
 *   ╚┈┈┈┈┈┈┈┈┈❖
 */

/* ------------------------------------------------------------------ */
/* Emoji per section                                                    */
/* ------------------------------------------------------------------ */

const SECTION_EMOJIS = {
  "Info User": "👤",
  "Info Hari": "📅",
  "Info Bot": "🤖",
  "Statistik Kamu": "📊",
  "Server": "📊",
};

const CATEGORY_EMOJIS_CLASSIC = {
  Main: "📂",
  AI: "🤖",
  Animanga: "🌸",
  Internet: "🌐",
  Download: "📥",
  Sticker: "🎨",
  Tools: "🔧",
  Islamic: "🕌",
  Group: "👥",
  Game: "🎮",
  RPG: "⚔️",
  Economy: "💰",
  Quotes: "💬",
  Maker: "🖌️",
  Owner: "👑",
  Info: "ℹ️",
  Fun: "🎉",
  Search: "🔍",
  Music: "🎵",
  Media: "🎬",
};

/* ------------------------------------------------------------------ */
/* Primitif                                                            */
/* ------------------------------------------------------------------ */

const GARIS = "┈".repeat(9);

/** Baris pembuka blok: ╔┈┈「 👤 *Judul* 」 */
function blokAtas(judul) {
  const emoji = SECTION_EMOJIS[judul] || "";
  const prefix = emoji ? `${emoji} ` : "";
  return `╔┈┈「 ${prefix}*${judul}* 」`;
}

/** Baris pemisah antar-bagian: ╠┈┈「 📅 *Judul* 」 */
function blokTengah(judul) {
  const emoji = SECTION_EMOJIS[judul] || "";
  const prefix = emoji ? `${emoji} ` : "";
  return `╠┈┈「 ${prefix}*${judul}* 」`;
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
/* Greeting dinamis                                                    */
/* ------------------------------------------------------------------ */

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 0 && h < 5) return "🌙 Selamat Subuh";
  if (h >= 5 && h < 11) return "🌅 Selamat Pagi";
  if (h >= 11 && h < 15) return "☀️ Selamat Siang";
  if (h >= 15 && h < 18) return "🌤️ Selamat Sore";
  if (h >= 18 && h < 24) return "🌙 Selamat Malam";
  return "👋 Halo";
}

/* ------------------------------------------------------------------ */
/* Header decorative                                                   */
/* ------------------------------------------------------------------ */

/** Banner pembuka menu — tetap ringkas, tidak berlebihan */
function headerBanner(namaBot, namaUser) {
  const greet = getGreeting();
  return [
    `╭──「 ✨ *${namaBot}* 」`,
    `│`,
    `│ ${greet}, *@${namaUser}*!`,
    `│ Berikut adalah daftar menu yang tersedia.`,
    `╰─────────────❖`,
    ``,
  ].join("\n");
}

/** Footer decorative dengan bot name */
function footerBanner(namaBot, prefix) {
  return [
    ``,
    `╭──「 💡 *Tips* 」`,
    `│ ❏ Ketik *${prefix}menucat <kategori>* untuk detail`,
    `│ ❏ Ketik *${prefix}modemenu* untuk ganti gaya tampilan`,
    `│ ❏ Ketik *${prefix}owner* untuk hubungi owner`,
    `╰─────────────❖`,
    ``,
    `✧ ${namaBot} • Multi Device ✧`,
  ].join("\n");
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
 * Blok kategori command — dengan emoji per kategori:
 *   ╔┈「 🤖 AI 」
 *   ╎ぎ .ai
 *   ╎ぎ .remini
 *   ╚┈┈┈┈┈┈┈┈┈❖
 */
function blokKategori(namaKategori, commands = [], prefix = ".") {
  const emoji = CATEGORY_EMOJIS_CLASSIC[namaKategori] || "📁";
  const out = [`╔┈「 ${emoji} ${namaKategori} 」`];
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
