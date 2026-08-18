/**
 * Clara Menu Mode
 * ---------------------------------------------------------------
 * Bot ini menyediakan DUA gaya tampilan menu:
 *
 *   1. "modern"  — gaya khas repo ini: ✧ header, ╭─ bracketBox, small caps
 *   2. "klasik"  — meniru Clara-MD orisinal (Zeltoria): ╔┈┈「 」 dan ╎❏ / ╎ぎ
 *
 * Mode tersimpan di settings database sehingga bertahan setelah restart,
 * dan bisa diubah kapan saja lewat command .modemenu.
 *
 * Pemilihan mode berlaku global (per-bot), bukan per-grup, karena ini
 * soal identitas tampilan bot secara keseluruhan.
 */

const KEY = "menuMode";
const MODE_VALID = ["modern", "klasik"];
const DEFAULT_MODE = "klasik";

/** Alias yang boleh diketik user untuk tiap mode. */
const ALIAS_MODE = {
  modern: "modern",
  baru: "modern",
  new: "modern",
  "2": "modern",
  klasik: "klasik",
  classic: "klasik",
  lama: "klasik",
  original: "klasik",
  ori: "klasik",
  "1": "klasik",
};

/**
 * Baca mode aktif.
 * Urutan: database -> config.js -> default.
 */
function getMode(db, botConfig = null) {
  try {
    const dari = db?.setting?.(KEY);
    if (MODE_VALID.includes(dari)) return dari;
  } catch {
    // database bermasalah — jatuh ke config/default
  }
  const dariConfig = botConfig?.ui?.menuMode;
  if (MODE_VALID.includes(dariConfig)) return dariConfig;
  return DEFAULT_MODE;
}

/**
 * Simpan mode.
 * @returns {boolean} berhasil atau tidak
 */
function setMode(db, mode) {
  if (!MODE_VALID.includes(mode)) return false;
  try {
    db?.setting?.(KEY, mode);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ubah input user jadi nama mode yang sah.
 * @returns {string|null} null bila tidak dikenali
 */
function resolveMode(input) {
  const k = String(input || "").trim().toLowerCase();
  return ALIAS_MODE[k] || null;
}

/** Nama tampilan mode untuk ditampilkan ke user. */
function labelMode(mode) {
  return mode === "modern" ? "Modern" : "Klasik";
}

export { getMode, setMode, resolveMode, labelMode, MODE_VALID, DEFAULT_MODE, KEY };
