/**
 * Clara Menu Builder — Enhanced
 * ---------------------------------------------------------------
 * Penyusun teks menu untuk DUA gaya tampilan:
 *
 *   buildMenuModern()  — gaya repo ini (✧ header, ╭─ box, small caps)
 *   buildMenuKlasik()  — gaya Clara-MD orisinal + sentuhan enhanced
 *                        (emoji per section, greeting, footer)
 *
 * Dipisah dari plugin supaya .menu dan .allmenu bisa memakai keduanya
 * tanpa menyalin kode, dan supaya gampang diuji.
 */

import os from "os";

// --- gaya modern ---
import {
  alyaHeader,
  infoBlock,
  userInfoBlock,
  alyaCategoryRow,
  separator,
  tipText,
  toMonoUpperBold,
} from "./clara-menu-style.js";
import { formatUptime } from "./clara-formatter.js";

// --- gaya klasik ---
import {
  blok,
  blokKategori,
  baris,
  clockString,
  getWeton,
  tanggalIslam,
  namaHari,
  tanggalLengkap,
  jamWib,
  READ_MORE,
  getGreeting,
  headerBanner,
  footerBanner,
} from "./clara-classic-style.js";
import { getRole } from "./clara-level.js";

import {
  getCommandsByCategory,
  getSortedCategories,
  getPluginCount,
  CATEGORY_EMOJIS,
} from "./clara-plugins.js";

const EXP_PER_LEVEL = 10000;

/**
 * Normalkan uptime ke milidetik.
 */
function uptimeMs(uptime) {
  const n = Number(uptime) || 0;
  if (n <= 0) return 0;
  return n < 1_000_000 ? n * 1000 : n;
}

/** Label kategori rapi, meniru tabel `tags` Clara lama. */
const LABEL_KATEGORI = {
  main: "Main",
  ai: "AI",
  anime: "Animanga",
  internet: "Internet",
  download: "Download",
  downloader: "Download",
  sticker: "Sticker",
  tools: "Tools",
  religi: "Islamic",
  islamic: "Islamic",
  group: "Group",
  game: "Game",
  rpg: "RPG",
  economy: "Economy",
  quotes: "Quotes",
  maker: "Maker",
  owner: "Owner",
  info: "Info",
  fun: "Fun",
  search: "Search",
  music: "Music",
  media: "Media",
};

function labelKategori(cat) {
  return LABEL_KATEGORI[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

function formatRAM() {
  const used = process.memoryUsage().rss;
  const total = os.totalmem();
  return `${(used / 1024 / 1024).toFixed(0)}MB / ${(total / 1024 / 1024 / 1024).toFixed(1)}GB`;
}

/** Baca data user dengan aman */
function ambilUser(db, jid) {
  try {
    return (db?.getUser ? db.getUser(jid) : null) || {};
  } catch {
    return {};
  }
}

function totalPengguna(db) {
  try {
    return Object.keys(db?.getAllUsers?.() || {}).length;
  } catch {
    return 0;
  }
}

/* ================================================================== */
/* GAYA KLASIK — Clara-MD orisinal + enhanced                           */
/* ================================================================== */

function buildHeaderKlasik(m, botConfig, uptime, db) {
  const prefix = botConfig.command?.prefix || ".";
  const d = new Date();
  const nomor = String(m.sender || "").split("@")[0];

  const user = ambilUser(db, m.sender);
  const level = user.level ?? 1;
  const exp = user.exp ?? 0;
  const role = m.isOwner ? "👑 Owner" : getRole(level);
  const mode =
    (botConfig.mode || "public").toLowerCase() === "self" ? "Private" : "Publik";

  return blok([
    {
      judul: "Info User",
      baris: [
        baris("Nama", m.pushName || "Tanpa Nama"),
        baris("Nomor", `@${nomor}`),
        baris("Premium", user.isPremium ? "Premium" : "Free"),
        baris("Limit", user.energi === -1 ? "∞" : (user.energi ?? 0)),
        baris("Money", user.koin ?? 0),
        baris("Role", role),
        baris("Level", level),
        baris("Xp", `${exp % EXP_PER_LEVEL} / ${EXP_PER_LEVEL}`),
        baris("Total Xp", exp),
      ],
    },
    {
      judul: "Info Hari",
      baris: [
        baris("Waktu", jamWib(d)),
        baris("Hari", `${namaHari(d)} ${getWeton(d)}`),
        baris("Tanggal", tanggalLengkap(d)),
        baris("Tanggal Islam", tanggalIslam(d)),
      ],
    },
    {
      judul: "Info Bot",
      baris: [
        baris("Bot Name", botConfig.bot?.name || "Clara"),
        baris("Mode", mode),
        baris("Platform", os.platform()),
        baris("Type", "Node.Js"),
        baris("Baileys", "Multi Device"),
        baris("Prefix", `[ *${prefix}* ]`),
        baris("Uptime", clockString(uptimeMs(uptime))),
        baris("RAM", formatRAM()),
        baris("Total Command", getPluginCount()),
        baris("Database", `${totalPengguna(db)} pengguna`),
      ],
    },
  ]);
}

function buildKategoriKlasik(m, prefix, hanyaKategori = null) {
  const commandsByCategory = getCommandsByCategory();
  const out = [];

  for (const { name: cat } of getSortedCategories(m)) {
    if (cat === "owner" && !m.isOwner) continue;
    if (hanyaKategori && cat !== hanyaKategori) continue;
    const cmds = commandsByCategory[cat] || [];
    if (!cmds.length) continue;
    out.push(blokKategori(labelKategori(cat), cmds, prefix));
  }
  return out.join("\n\n");
}

/**
 * Menu lengkap gaya klasik: banner + header + readmore + kategori + footer.
 */
function buildMenuKlasik(m, botConfig, uptime, db, opsi = {}) {
  const { pakaiReadMore = true, hanyaKategori = null } = opsi;
  const prefix = botConfig.command?.prefix || ".";
  const namaBot = botConfig.bot?.name || "Clara";
  const nomor = String(m.sender || "").split("@")[0];

  // Banner pembuka
  const banner = headerBanner(namaBot, nomor);

  // Header info
  const header = buildHeaderKlasik(m, botConfig, uptime, db);

  // Footer
  const footer = footerBanner(namaBot, prefix);

  // Kalau hanya satu kategori (dari .menucat), tampilkan tanpa readmore
  if (hanyaKategori) {
    const kategori = buildKategoriKlasik(m, prefix, hanyaKategori);
    return `${banner}${header}\n\n${kategori}\n${footer}`;
  }

  // Menu lengkap dengan readmore
  const kategori = buildKategoriKlasik(m, prefix);
  const sambungan = pakaiReadMore ? READ_MORE : "\n";

  return `${banner}${header}\n${sambungan}\n${kategori}\n${footer}`;
}

/* ================================================================== */
/* GAYA MODERN — khas repo ini                                        */
/* ================================================================== */

function buildHeaderModern(m, botConfig, uptime, db) {
  const prefix = botConfig.command?.prefix || ".";
  const d = new Date();
  const timeStr = d.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
  const dateStr = d.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let txt = alyaHeader("Menu Utama", "🤖") + "\n\n";
  txt += userInfoBlock(m.pushName, m.sender, "active", m.isOwner ? "owner" : "user");
  txt += "\n\n";

  const user = ambilUser(db, m.sender);
  if (Object.keys(user).length && !m.isOwner) {
    txt += infoBlock(
      [
        ["Level", user.level ?? 1],
        ["Exp", user.exp ?? 0],
        ["Koin", user.koin ?? 0],
        ["Energi", user.energi === -1 ? "∞" : (user.energi ?? 0)],
        ["Status", user.isPremium ? "💎 Premium" : "Reguler"],
      ],
      "sᴛᴀᴛɪsᴛɪᴋ ᴋᴀᴍᴜ",
      "🌸",
    );
    txt += "\n\n";
  }

  txt += infoBlock(
    [
      ["Bot", botConfig.bot?.name || "Clara"],
      ["Versi", botConfig.bot?.version || "1.0"],
      ["Mode", (botConfig.mode || "public").toUpperCase()],
      ["Total Command", getPluginCount()],
      ["Uptime", formatUptime(uptimeMs(uptime))],
      ["RAM", formatRAM()],
      ["Platform", `${os.type()} · Node ${process.version}`],
      ["Prefix", `[ ${prefix} ]`],
      ["Tanggal", dateStr],
      ["Waktu", timeStr],
    ],
    "sᴇʀᴠᴇʀ",
    "📊",
  );
  return txt;
}

function buildKategoriModern(m, prefix, hanyaKategori = null) {
  const commandsByCategory = getCommandsByCategory();
  let txt = "";

  for (const { name: cat } of getSortedCategories(m)) {
    if (cat === "owner" && !m.isOwner) continue;
    if (hanyaKategori && cat !== hanyaKategori) continue;
    const cmds = commandsByCategory[cat] || [];
    if (!cmds.length) continue;
    txt +=
      alyaCategoryRow(
        CATEGORY_EMOJIS[cat] || "📁",
        cat,
        cmds.map((c) => `${prefix}${c}`).join(" | "),
      ) + "\n\n";
  }
  return txt.trimEnd();
}

/**
 * Menu lengkap gaya modern.
 */
function buildMenuModern(m, botConfig, uptime, db, opsi = {}) {
  const { hanyaKategori = null } = opsi;
  const prefix = botConfig.command?.prefix || ".";
  const header = buildHeaderModern(m, botConfig, uptime, db);
  const kategori = buildKategoriModern(m, prefix, hanyaKategori);
  return (
    `${header}\n\n${kategori}\n\n` +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}menucat <kategori> untuk detail`) +
    "\n" +
    tipText(`Ketik ${prefix}modemenu untuk ganti gaya tampilan`)
  );
}

/* ================================================================== */
/* Pemilih otomatis                                                   */
/* ================================================================== */

/**
 * Susun menu sesuai mode yang aktif.
 * @param {"modern"|"klasik"} mode
 */
function buildMenu(mode, m, botConfig, uptime, db, opsi = {}) {
  return mode === "modern"
    ? buildMenuModern(m, botConfig, uptime, db, opsi)
    : buildMenuKlasik(m, botConfig, uptime, db, opsi);
}

export {
  uptimeMs,
  buildMenu,
  buildMenuKlasik,
  buildMenuModern,
  buildHeaderKlasik,
  buildHeaderModern,
  buildKategoriKlasik,
  buildKategoriModern,
  labelKategori,
  formatRAM,
  LABEL_KATEGORI,
};
