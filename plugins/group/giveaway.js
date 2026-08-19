// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Giveaway Grup
 * ---------------------------------------------------------------
 * Sistem giveaway berbasis reaksi/keyword dengan penarikan pemenang
 * otomatis saat waktu habis.
 *
 * src/connection.js sudah memanggil startGiveawayChecker(sock, db)
 * saat koneksi siap, tapi file ini sebelumnya tidak ada sehingga
 * checker tidak pernah berjalan.
 *
 * Alur:
 *   .giveaway start 30m 1 Voucher 50rb   -> buka giveaway
 *   peserta ketik: ikut                  -> terdaftar
 *   otomatis saat waktu habis            -> pemenang diumumkan
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const SETTING_KEY = "giveaway";
const CHECK_INTERVAL_MS = 30_000;
const JOIN_KEYWORDS = ["ikut", "join", "gas", "hadir", "daftar"];

let checkerTimer = null;
let checkerSock = null;

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getAll(db) {
  try {
    const raw = db?.setting?.(SETTING_KEY);
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function saveAll(db, data) {
  try {
    db?.setting?.(SETTING_KEY, data);
    return true;
  } catch {
    return false;
  }
}

function getGiveaway(db, groupId) {
  const all = getAll(db);
  return all[groupId] || null;
}

function setGiveaway(db, groupId, value) {
  const all = getAll(db);
  if (value === null) delete all[groupId];
  else all[groupId] = value;
  saveAll(db, all);
}

function num(jid) {
  return String(jid || "").split("@")[0].split(":")[0];
}

/* ------------------------------------------------------------------ */
/* Parse durasi: 30m, 2h, 1d, 90s                                      */
/* ------------------------------------------------------------------ */

function parseDuration(input) {
  const match = String(input || "").match(/^(\d+)\s*(s|m|h|d|detik|menit|jam|hari)?$/i);
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
  if (ms > 7 * 86400_000) return null; // maksimal 7 hari
  return ms;
}

function formatRemaining(ms) {
  if (ms <= 0) return "selesai";
  const d = Math.floor(ms / 86400_000);
  const h = Math.floor((ms % 86400_000) / 3600_000);
  const mnt = Math.floor((ms % 3600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const parts = [];
  if (d) parts.push(`${d}h`);
  if (h) parts.push(`${h}j`);
  if (mnt) parts.push(`${mnt}m`);
  if (!d && !h && s) parts.push(`${s}d`);
  return parts.join(" ") || "sebentar lagi";
}

/* ------------------------------------------------------------------ */
/* Pengundian                                                          */
/* ------------------------------------------------------------------ */

function drawWinners(participants, count) {
  const pool = [...participants];
  const winners = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }
  return winners;
}

async function finishGiveaway(sock, db, groupId, ga) {
  const winners = drawWinners(ga.participants || [], ga.winnerCount || 1);

  let text;
  let mentions = [];

  if (!winners.length) {
    text =
      alyaHeader("Giveaway Selesai", "🎁") +
      "\n\n" +
      bracketBox("😔", "ʜᴀꜱɪʟ", [
        `◦ Hadiah: *${ga.prize}*`,
        "◦ Tidak ada peserta yang ikut.",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Coba adakan giveaway lagi lain waktu");
  } else {
    mentions = winners.map((w) => `${num(w)}@s.whatsapp.net`);
    text =
      alyaHeader("Pemenang Giveaway", "🎉") +
      "\n\n" +
      bracketBox("🎁", "ʜᴀᴅɪᴀʜ", [`◦ ${ga.prize}`]) +
      "\n\n" +
      bracketBox("🏆", "ᴘᴇᴍᴇɴᴀɴɢ", winners.map((w, i) => `◦ ${i + 1}. @${num(w)}`)) +
      "\n\n" +
      bracketBox("📊", "ɪɴꜰᴏ", [
        `◦ Total peserta: *${(ga.participants || []).length}*`,
        `◦ Jumlah pemenang: *${winners.length}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Selamat! Hubungi admin untuk klaim hadiah");
  }

  try {
    await sock.sendMessage(groupId, { text, mentions });
  } catch {
    // tetap tutup giveaway walau gagal kirim
  }

  setGiveaway(db, groupId, null);
}

/* ------------------------------------------------------------------ */
/* Checker otomatis — dipanggil connection.js                          */
/* ------------------------------------------------------------------ */

function startGiveawayChecker(sock, db) {
  stopGiveawayChecker();
  checkerSock = sock;

  checkerTimer = setInterval(async () => {
    try {
      if (!checkerSock) return;
      const all = getAll(db);
      const now = Date.now();

      for (const [groupId, ga] of Object.entries(all)) {
        if (!ga || typeof ga !== "object") continue;
        if (!ga.endAt || ga.endAt > now) continue;
        await finishGiveaway(checkerSock, db, groupId, ga);
      }
    } catch {
      // jangan sampai interval mati karena satu error
    }
  }, CHECK_INTERVAL_MS);

  if (typeof checkerTimer.unref === "function") checkerTimer.unref();
  return { started: true, interval: CHECK_INTERVAL_MS };
}

function stopGiveawayChecker() {
  if (checkerTimer) {
    clearInterval(checkerTimer);
    checkerTimer = null;
  }
  checkerSock = null;
}

/**
 * Dipanggil dari plugin listener untuk mendaftarkan peserta.
 * @returns {Promise<boolean>} true bila pesan ini adalah pendaftaran
 */
async function tryJoin(m, db) {
  try {
    if (!m?.isGroup) return false;
    const ga = getGiveaway(db, m.chat);
    if (!ga || !ga.endAt || ga.endAt <= Date.now()) return false;

    const word = String(m.text || "").trim().toLowerCase();
    if (!JOIN_KEYWORDS.includes(word)) return false;

    const sender = num(m.sender);
    ga.participants = Array.isArray(ga.participants) ? ga.participants : [];
    if (ga.participants.some((p) => num(p) === sender)) return false;

    ga.participants.push(sender);
    setGiveaway(db, m.chat, ga);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin command                                                      */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "giveaway",
  alias: ["giveaway", "ga", "undian", "bagibagi"],
  category: "group",
  description: "Adakan giveaway grup dengan pemenang acak otomatis",
  usage: ".giveaway start <durasi> <jml_pemenang> <hadiah>",
  example: ".giveaway start 30m 1 Voucher 50rb",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix) {
  return (
    alyaHeader("Giveaway", "🎁") +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}giveaway start <durasi> <jml> <hadiah>*`,
      `◦ *${prefix}giveaway info* — lihat yang berjalan`,
      `◦ *${prefix}giveaway peserta* — daftar peserta`,
      `◦ *${prefix}giveaway cancel* — batalkan`,
      `◦ *${prefix}giveaway draw* — undi sekarang`,
    ]) +
    "\n\n" +
    bracketBox("⏱️", "ᴅᴜʀᴀꜱɪ", [
      "◦ 90s / 30m / 2h / 1d (maks 7 hari)",
    ]) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}giveaway start 30m 1 Voucher 50rb`,
      `◦ ${prefix}giveaway start 2h 3 Pulsa 10rb`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Peserta cukup ketik: ${JOIN_KEYWORDS.slice(0, 3).join(" / ")}`)
  );
}

function isGroupAdmin(m) {
  if (m.isOwner) return true;
  // clara-serialize.js sudah menyediakan m.isAdmin dan m.groupMembers.
  // Catatan: m.groupMetadata adalah OBJEK, bukan fungsi.
  if (m.isAdmin === true) return true;
  // array kosong itu truthy, jadi fallback harus cek panjangnya
  const gm = Array.isArray(m.groupMembers) && m.groupMembers.length ? m.groupMembers : null;
  const parts = gm || m.groupMetadata?.participants || [];
  return parts.some((p) => num(p.id) === num(m.sender) && p.admin);
}

async function handler(m, { sock, config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const groupId = m.chat;
    const current = getGiveaway(db, groupId);

    /* --- start --- */
    if (sub === "start" || sub === "mulai" || sub === "buka") {
      if (!isGroupAdmin(m)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa memulai giveaway."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Minta bantuan admin grup")
        );
        return { handled: true };
      }

      if (current && current.endAt > Date.now()) {
        await m.reply(
          alyaHeader("Sedang Berjalan", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Hadiah: *${current.prize}*`,
              `◦ Sisa waktu: *${formatRemaining(current.endAt - Date.now())}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}giveaway cancel untuk membatalkan`)
        );
        return { handled: true };
      }

      const ms = parseDuration(args[1]);
      const winnerCount = parseInt(args[2], 10);
      const prize = args.slice(3).join(" ").trim();

      if (!ms || !Number.isFinite(winnerCount) || winnerCount < 1 || !prize) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }

      if (winnerCount > 50) {
        await m.reply(
          alyaHeader("Terlalu Banyak", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ʙᴀᴛᴀꜱ", ["◦ Maksimal 50 pemenang."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Kurangi jumlah pemenang")
        );
        return { handled: true };
      }

      const endAt = Date.now() + ms;
      setGiveaway(db, groupId, {
        prize,
        winnerCount,
        endAt,
        startedBy: num(m.sender),
        participants: [],
      });

      await m.reply(
        alyaHeader("Giveaway Dibuka", "🎁") +
          "\n\n" +
          bracketBox("🎁", "ʜᴀᴅɪᴀʜ", [`◦ ${prize}`]) +
          "\n\n" +
          bracketBox("📊", "ᴅᴇᴛᴀɪʟ", [
            `◦ Pemenang: *${winnerCount} orang*`,
            `◦ Berakhir dalam: *${formatRemaining(ms)}*`,
            `◦ Dibuka oleh: @${num(m.sender)}`,
          ]) +
          "\n\n" +
          bracketBox("✋", "ᴄᴀʀᴀ ɪᴋᴜᴛ", [
            `◦ Ketik: *${JOIN_KEYWORDS.slice(0, 3).join("* / *")}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Pemenang diundi otomatis saat waktu habis"),
        { mentions: [`${num(m.sender)}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- info --- */
    if (!sub || sub === "info" || sub === "status") {
      if (!current || current.endAt <= Date.now()) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      await m.reply(
        alyaHeader("Giveaway Aktif", "🎁") +
          "\n\n" +
          bracketBox("🎁", "ʜᴀᴅɪᴀʜ", [`◦ ${current.prize}`]) +
          "\n\n" +
          bracketBox("📊", "ᴅᴇᴛᴀɪʟ", [
            `◦ Peserta: *${(current.participants || []).length} orang*`,
            `◦ Pemenang: *${current.winnerCount}*`,
            `◦ Sisa waktu: *${formatRemaining(current.endAt - Date.now())}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik *${JOIN_KEYWORDS[0]}* untuk ikut`)
      );
      return { handled: true };
    }

    /* --- peserta --- */
    if (sub === "peserta" || sub === "list" || sub === "participants") {
      if (!current) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      const p = current.participants || [];
      const lines = p.length
        ? p.slice(0, 30).map((x, i) => `◦ ${i + 1}. @${num(x)}`)
        : ["◦ Belum ada peserta."];
      await m.reply(
        alyaHeader("Peserta Giveaway", "👥") +
          "\n\n" +
          bracketBox("👥", "ᴅᴀꜰᴛᴀʀ", lines) +
          "\n\n" +
          bracketBox("📊", "ᴛᴏᴛᴀʟ", [`◦ *${p.length} peserta*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(p.length > 30 ? "Menampilkan 30 pertama" : "Semua peserta terdaftar"),
        { mentions: p.slice(0, 30).map((x) => `${num(x)}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- cancel --- */
    if (sub === "cancel" || sub === "batal" || sub === "stop") {
      if (!isGroupAdmin(m)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Minta bantuan admin")
        );
        return { handled: true };
      }
      if (!current) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      setGiveaway(db, groupId, null);
      await m.reply(
        alyaHeader("Dibatalkan", "🚫") +
          "\n\n" +
          bracketBox("🚫", "ɪɴꜰᴏ", [`◦ Giveaway *${current.prize}* dibatalkan.`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}giveaway start untuk membuat baru`)
      );
      return { handled: true };
    }

    /* --- draw sekarang --- */
    if (sub === "draw" || sub === "undi" || sub === "tarik") {
      if (!isGroupAdmin(m)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Minta bantuan admin")
        );
        return { handled: true };
      }
      if (!current) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      await finishGiveaway(sock, db, groupId, current);
      return { handled: true };
    }

    await m.reply(helpText(prefix));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}giveaway untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export {
  startGiveawayChecker,
  stopGiveawayChecker,
  tryJoin,
  parseDuration,
  formatRemaining,
  drawWinners,
  getGiveaway,
  setGiveaway,
  finishGiveaway,
  JOIN_KEYWORDS,
};
