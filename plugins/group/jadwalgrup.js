/**
 * Jadwal Grup
 * ---------------------------------------------------------------
 * Buka/tutup grup otomatis pada jam tertentu. Berguna untuk grup
 * kelas, kantor, atau komunitas yang ingin membatasi jam ngobrol.
 *
 * "Tutup" = hanya admin yang bisa kirim pesan (announcement mode).
 * Checker berjalan tiap menit dan membandingkan jam Asia/Jakarta.
 */

import { CronJob } from "cron";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  isAdmin,
  readAllState,
  readGroupState,
  writeGroupState,
  todayKey,
} from "../../src/lib/clara-group-util.js";

const KEY = "jadwalGrup";
const TZ = "Asia/Jakarta";

let job = null;
let activeSock = null;
const sudah = new Set(); // "groupId:YYYY-MM-DD:buka|tutup"

/* ------------------------------------------------------------------ */
/* Waktu                                                               */
/* ------------------------------------------------------------------ */

/** "07:30" -> menit sejak tengah malam, null bila tidak valid. */
function toMinutes(hhmm) {
  const m = String(hhmm || "").trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mi = parseInt(m[2], 10);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

function fmtMinutes(min) {
  if (min === null || min === undefined) return "-";
  const h = Math.floor(min / 60);
  const mi = min % 60;
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

function nowMinutes() {
  const n = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
  return n.getHours() * 60 + n.getMinutes();
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getCfg(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  if (!raw || typeof raw !== "object") return null;
  return {
    buka: Number.isInteger(raw.buka) ? raw.buka : null,
    tutup: Number.isInteger(raw.tutup) ? raw.tutup : null,
    aktif: raw.aktif !== false,
  };
}

function saveCfg(db, groupId, cfg) {
  writeGroupState(db, KEY, groupId, cfg);
}

/* ------------------------------------------------------------------ */
/* Eksekusi                                                            */
/* ------------------------------------------------------------------ */

async function ubahGrup(sock, groupId, tutup) {
  // "announcement" = hanya admin yang bisa kirim
  await sock.groupSettingUpdate(groupId, tutup ? "announcement" : "not_announcement");
}

/**
 * Satu siklus pengecekan. Diekspor supaya bisa diuji tanpa cron.
 * @returns {Promise<number>} berapa grup yang diubah
 */
async function tick(sock, db, saatIni = nowMinutes(), hari = todayKey()) {
  const all = readAllState(db, KEY);
  let diubah = 0;

  for (const [groupId, raw] of Object.entries(all)) {
    try {
      if (!raw || raw.aktif === false) continue;

      for (const [jenis, target] of [
        ["buka", raw.buka],
        ["tutup", raw.tutup],
      ]) {
        if (!Number.isInteger(target) || target !== saatIni) continue;

        const tanda = `${groupId}:${hari}:${jenis}`;
        if (sudah.has(tanda)) continue;
        sudah.add(tanda);

        const tutup = jenis === "tutup";
        await ubahGrup(sock, groupId, tutup);

        const text =
          alyaHeader(tutup ? "Grup Ditutup" : "Grup Dibuka", tutup ? "🔒" : "🔓") +
          "\n\n" +
          bracketBox(tutup ? "🔒" : "🔓", "ᴊᴀᴅᴡᴀʟ", [
            tutup
              ? "◦ Sekarang hanya admin yang bisa kirim pesan."
              : "◦ Semua member bisa kirim pesan lagi.",
            `◦ Waktu: *${fmtMinutes(target)} WIB*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(tutup ? "Sampai jumpa besok" : "Selamat beraktivitas");

        await sock.sendMessage(groupId, { text });
        diubah++;
      }
    } catch {
      // satu grup gagal tidak menghentikan yang lain
    }
  }

  // Jaga Set tidak membengkak lintas hari
  if (sudah.size > 500) {
    for (const k of [...sudah]) if (!k.includes(`:${hari}:`)) sudah.delete(k);
  }

  return diubah;
}

function startJadwalChecker(sock, db) {
  stopJadwalChecker();
  activeSock = sock;

  job = new CronJob(
    "*/1 * * * *",
    async () => {
      if (!activeSock) return;
      try {
        const activeDb =
          db || (await import("../../src/lib/clara-database.js")).getDatabase();
        await tick(activeSock, activeDb);
      } catch {
        // abaikan
      }
    },
    null,
    true,
    TZ
  );

  return { started: true };
}

function stopJadwalChecker() {
  if (job) {
    job.stop();
    job = null;
  }
  activeSock = null;
  sudah.clear();
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "jadwalgrup",
  alias: ["jadwalgrup", "autoclose", "tutupotomatis", "jamgrup"],
  category: "group",
  description: "Buka/tutup grup otomatis pada jam tertentu",
  usage: ".jadwalgrup set 07:00 22:00 | off | status",
  example: ".jadwalgrup set 07:00 22:00",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function statusText(prefix, cfg) {
  return (
    alyaHeader("Jadwal Grup", "🕐") +
    "\n\n" +
    bracketBox("🕐", "ꜱᴛᴀᴛᴜꜱ", [
      `◦ Aktif: *${cfg?.aktif ? "ya" : "tidak"}*`,
      `◦ Buka: *${cfg ? fmtMinutes(cfg.buka) : "-"} WIB*`,
      `◦ Tutup: *${cfg ? fmtMinutes(cfg.tutup) : "-"} WIB*`,
      `◦ Sekarang: *${fmtMinutes(nowMinutes())} WIB*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}jadwalgrup set 07:00 22:00*`,
      `◦ *${prefix}jadwalgrup off*`,
      `◦ *${prefix}jadwalgrup buka* — buka sekarang`,
      `◦ *${prefix}jadwalgrup tutup* — tutup sekarang`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Bot harus admin agar bisa buka/tutup grup")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa mengatur jadwal."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}jadwalgrup untuk lihat status`)
  );
}

async function handler(m, { sock, config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const cfg = getCfg(db, m.chat);

    if (!sub || sub === "status") {
      await m.reply(statusText(prefix, cfg));
      return { handled: true };
    }

    if (sub === "set" || sub === "atur") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const buka = toMinutes(args[1]);
      const tutup = toMinutes(args[2]);

      if (buka === null || tutup === null) {
        await m.reply(
          alyaHeader("Format Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Contoh: *${prefix}jadwalgrup set 07:00 22:00*`,
              "◦ Format 24 jam, HH:MM.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Buka dulu, lalu jam tutup")
        );
        return { handled: true };
      }
      if (buka === tutup) {
        await m.reply(
          alyaHeader("Jam Sama", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", ["◦ Jam buka dan tutup tidak boleh sama."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Beri jarak minimal 1 menit")
        );
        return { handled: true };
      }

      saveCfg(db, m.chat, { buka, tutup, aktif: true });
      await m.reply(
        alyaHeader("Jadwal Diset", "🕐") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Buka: *${fmtMinutes(buka)} WIB*`,
            `◦ Tutup: *${fmtMinutes(tutup)} WIB*`,
            "◦ Berlaku setiap hari.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Pastikan bot sudah jadi admin grup")
      );
      return { handled: true };
    }

    if (sub === "off" || sub === "nonaktif" || sub === "hapus") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      writeGroupState(db, KEY, m.chat, null);
      await m.reply(
        alyaHeader("Jadwal Dimatikan", "🕐") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", ["◦ Grup tidak lagi dibuka/ditutup otomatis."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}jadwalgrup set untuk mengaktifkan lagi`)
      );
      return { handled: true };
    }

    if (sub === "buka" || sub === "tutup") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const tutup = sub === "tutup";
      try {
        await ubahGrup(sock, m.chat, tutup);
      } catch (e) {
        await m.reply(
          alyaHeader("Gagal", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              "◦ Bot mungkin belum jadi admin grup.",
              `◦ Detail: *${String(e.message).slice(0, 80)}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Jadikan bot admin lalu coba lagi")
        );
        return { handled: true };
      }

      await m.reply(
        alyaHeader(tutup ? "Grup Ditutup" : "Grup Dibuka", tutup ? "🔒" : "🔓") +
          "\n\n" +
          bracketBox(tutup ? "🔒" : "🔓", "ɪɴꜰᴏ", [
            tutup
              ? "◦ Hanya admin yang bisa kirim pesan."
              : "◦ Semua member bisa kirim pesan.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Perubahan manual, jadwal tetap berjalan")
      );
      return { handled: true };
    }

    await m.reply(statusText(prefix, cfg));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}jadwalgrup untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export {
  startJadwalChecker,
  stopJadwalChecker,
  tick,
  toMinutes,
  fmtMinutes,
  getCfg,
  saveCfg,
  sudah,
  KEY,
};
