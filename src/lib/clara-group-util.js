/**
 * Clara Group Util
 * ---------------------------------------------------------------
 * Helper bersama untuk plugin grup, supaya pengecekan admin dan
 * akses state tidak ditulis ulang (dan salah) di tiap plugin.
 *
 * Catatan penting soal m.groupMetadata:
 *   clara-serialize.js mengisinya sebagai OBJEK hasil sock.groupMetadata(),
 *   bukan fungsi. Memanggil m.groupMetadata() akan melempar TypeError.
 *   Serializer juga sudah menyediakan m.isAdmin, m.isBotAdmin,
 *   m.groupMembers, dan m.groupAdmins — pakai itu.
 */

/** Ambil digit nomor dari JID/LID apa pun. */
function num(jid) {
  return String(jid || "").split("@")[0].split(":")[0];
}

/** Jadikan JID WhatsApp standar dari nomor/JID. */
function toJid(input) {
  const n = num(input);
  return n ? `${n}@s.whatsapp.net` : "";
}

/**
 * Apakah pengirim admin grup (atau owner bot).
 * Sinkron — tidak perlu await.
 */
function isAdmin(m) {
  if (!m) return false;
  if (m.isOwner) return true;
  if (m.isAdmin === true) return true;
  const parts = participantsOf(m);
  const me = num(m.sender);
  return parts.some((p) => num(p.id) === me && p.admin);
}

/**
 * Ambil daftar participant dengan fallback yang benar.
 * Catatan: array kosong bersifat truthy, jadi `a || b` TIDAK cukup —
 * clara-serialize.js menyetel groupMembers = [] saat metadata gagal diambil,
 * sehingga fallback ke groupMetadata harus dicek lewat panjang array.
 */
function participantsOf(m) {
  const a = m?.groupMembers;
  if (Array.isArray(a) && a.length) return a;
  const b = m?.groupMetadata?.participants;
  if (Array.isArray(b) && b.length) return b;
  return [];
}

/** Apakah bot sendiri admin di grup ini. */
function isBotAdmin(m) {
  return m?.isBotAdmin === true;
}

/** Daftar JID semua member grup. */
function memberJids(m) {
  return participantsOf(m).map((p) => p.id).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* State per grup di settings                                          */
/* ------------------------------------------------------------------ */

/**
 * Baca state bersarang: settings[key][groupId]
 * @returns {any} nilai default bila belum ada
 */
function readGroupState(db, key, groupId, fallback = null) {
  try {
    const all = db?.setting?.(key);
    if (!all || typeof all !== "object") return fallback;
    const val = all[groupId];
    return val === undefined ? fallback : val;
  } catch {
    return fallback;
  }
}

/** Tulis state bersarang: settings[key][groupId] = value (null = hapus) */
function writeGroupState(db, key, groupId, value) {
  try {
    const all = db?.setting?.(key) || {};
    const next = all && typeof all === "object" ? { ...all } : {};
    if (value === null) delete next[groupId];
    else next[groupId] = value;
    db?.setting?.(key, next);
    return true;
  } catch {
    return false;
  }
}

/** Baca seluruh map settings[key] */
function readAllState(db, key) {
  try {
    const all = db?.setting?.(key);
    return all && typeof all === "object" ? all : {};
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* Format                                                              */
/* ------------------------------------------------------------------ */

/** Ubah milidetik jadi "2h 3j 15m" */
function humanDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "0m";
  const d = Math.floor(ms / 86400_000);
  const h = Math.floor((ms % 86400_000) / 3600_000);
  const mi = Math.floor((ms % 3600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const out = [];
  if (d) out.push(`${d}h`);
  if (h) out.push(`${h}j`);
  if (mi) out.push(`${mi}m`);
  if (!d && !h && !mi) out.push(`${s}d`);
  return out.join(" ");
}

/** Parse "30m" / "2h" / "1d" / "90s" -> ms (null bila tidak valid) */
function parseDuration(input, maxMs = 30 * 86400_000) {
  const match = String(input || "")
    .trim()
    .match(/^(\d+)\s*(s|m|h|d|detik|menit|jam|hari)?$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  const unit = (match[2] || "m").toLowerCase();
  const mult =
    unit === "s" || unit === "detik"
      ? 1000
      : unit === "h" || unit === "jam"
        ? 3600_000
        : unit === "d" || unit === "hari"
          ? 86400_000
          : 60_000;
  const ms = value * mult;
  return ms > maxMs ? null : ms;
}

/** Tanggal hari ini di Asia/Jakarta sebagai "YYYY-MM-DD" */
function todayKey(tz = "Asia/Jakarta") {
  const n = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(
    n.getDate()
  ).padStart(2, "0")}`;
}

export {
  num,
  toJid,
  isAdmin,
  participantsOf,
  isBotAdmin,
  memberJids,
  readGroupState,
  writeGroupState,
  readAllState,
  humanDuration,
  parseDuration,
  todayKey,
};
