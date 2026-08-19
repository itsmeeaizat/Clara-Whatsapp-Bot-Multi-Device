// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Auto Sahur
 * ---------------------------------------------------------------
 * Membangunkan anggota grup untuk sahur pada waktu tertentu sebelum
 * imsak, memakai jadwal imsak asli dari clara-sholat-api.js
 * (api.myquran.com) — bukan jam statis.
 *
 * Disebut di README sebagai plugin opsional yang belum tersedia.
 *
 * Cara kerja:
 *   - Cron tiap menit mengecek selisih waktu sekarang ke waktu imsak
 *     kota yang diset tiap grup.
 *   - Bila selisih == menit pengingat yang dikonfigurasi, kirim pesan.
 *   - Anti-duplikat: satu pengingat per grup per hari per tahap.
 */

import { CronJob } from "cron";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { searchKota, getTodaySchedule, extractPrayerTimes } from "../../src/lib/clara-sholat-api.js";

const SETTING_KEY = "autoSahur";
const TZ = "Asia/Jakarta";

/** Tahap pengingat: menit sebelum imsak */
const DEFAULT_STAGES = [60, 30, 10];

let sahurJob = null;
let sahurSock = null;
const notified = new Set(); // "groupId:YYYY-MM-DD:stage"

const PESAN_SAHUR = [
  "Bangun bangun, rezeki nggak dateng ke orang yang tidur terus 😴🍚",
  "Sahur dulu yuk, biar puasanya kuat sampai maghrib 💪",
  "Yang masih meringkuk di kasur, ayo bangun! Sahur sebentar lagi habis ⏰",
  "Jangan sampai cuma minum air putih terus lanjut tidur ya 🥤",
  "Sahur itu berkah, jangan dilewatkan 🌙",
];

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

function getConfig(db, groupId) {
  return getAll(db)[groupId] || null;
}

function setConfig(db, groupId, value) {
  const all = getAll(db);
  if (value === null) delete all[groupId];
  else all[groupId] = value;
  saveAll(db, all);
}

/* ------------------------------------------------------------------ */
/* Waktu                                                               */
/* ------------------------------------------------------------------ */

function nowInTz() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}

function todayKey() {
  const n = nowInTz();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

/** "04:35" -> menit sejak tengah malam */
function toMinutes(hhmm) {
  const match = String(hhmm || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const mi = parseInt(match[2], 10);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

function currentMinutes() {
  const n = nowInTz();
  return n.getHours() * 60 + n.getMinutes();
}

function pesanAcak() {
  return PESAN_SAHUR[Math.floor(Math.random() * PESAN_SAHUR.length)];
}

/* ------------------------------------------------------------------ */
/* Checker                                                             */
/* ------------------------------------------------------------------ */

async function checkAll(sock, db) {
  const all = getAll(db);
  const entries = Object.entries(all);
  if (!entries.length) return;

  const nowMin = currentMinutes();
  const day = todayKey();

  for (const [groupId, cfg] of entries) {
    try {
      if (!cfg?.enabled || !cfg?.kotaId) continue;

      const jadwal = await getTodaySchedule(cfg.kotaId);
      const times = extractPrayerTimes(jadwal);
      const imsakMin = toMinutes(times.imsak);
      if (imsakMin === null) continue;

      const stages = Array.isArray(cfg.stages) && cfg.stages.length ? cfg.stages : DEFAULT_STAGES;

      for (const stage of stages) {
        const targetMin = imsakMin - stage;
        if (targetMin !== nowMin) continue;

        const key = `${groupId}:${day}:${stage}`;
        if (notified.has(key)) continue;
        notified.add(key);

        const text =
          alyaHeader("Waktunya Sahur", "🌙") +
          "\n\n" +
          bracketBox("⏰", "ᴘᴇɴɢɪɴɢᴀᴛ", [
            `◦ Imsak *${cfg.kotaName || cfg.kotaId}*: *${times.imsak}*`,
            `◦ Subuh: *${times.subuh}*`,
            `◦ Sisa waktu: *${stage} menit lagi*`,
          ]) +
          "\n\n" +
          pesanAcak() +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Semoga puasanya lancar dan berkah");

        await sock.sendMessage(groupId, { text });
      }
    } catch {
      // satu grup gagal jangan hentikan grup lain
    }
  }

  // Bersihkan penanda hari sebelumnya agar Set tidak membengkak
  if (notified.size > 500) {
    for (const k of notified) {
      if (!k.includes(`:${day}:`)) notified.delete(k);
    }
  }
}

function startSahurChecker(sock, db) {
  stopSahurChecker();
  sahurSock = sock;

  sahurJob = new CronJob(
    "*/1 * * * *",
    async () => {
      if (!sahurSock) return;
      try {
        const activeDb = db || (await import("../../src/lib/clara-database.js")).getDatabase();
        await checkAll(sahurSock, activeDb);
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

/**
 * Entry point yang dipanggil index.js saat koneksi siap.
 * Nama & signature mengikuti kontrak yang sudah ada di index.js:
 *   const { initSahurCron } = await import("./plugins/religi/autosahur.js");
 *   initSahurCron(sock);
 */
function initSahurCron(sock) {
  return startSahurChecker(sock, null);
}

function stopSahurChecker() {
  if (sahurJob) {
    sahurJob.stop();
    sahurJob = null;
  }
  sahurSock = null;
  notified.clear();
}

/* ------------------------------------------------------------------ */
/* Plugin command                                                      */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "autosahur",
  alias: ["autosahur", "auto-sahur", "sahur", "bangunin", "sahurin"],
  category: "religi",
  description: "Pengingat sahur otomatis berdasarkan jadwal imsak kota",
  usage: ".autosahur on <kota> | off | status",
  example: ".autosahur on jakarta",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function num(jid) {
  return String(jid || "").split("@")[0].split(":")[0];
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

function helpText(prefix, cfg) {
  return (
    alyaHeader("Auto Sahur", "🌙") +
    "\n\n" +
    bracketBox("🌙", "ꜱᴛᴀᴛᴜꜱ", [
      `◦ Grup ini: *${cfg?.enabled ? "AKTIF" : "NONAKTIF"}*`,
      cfg?.kotaName ? `◦ Kota: *${cfg.kotaName}*` : "◦ Kota: *belum diset*",
      `◦ Pengingat: *${(cfg?.stages || DEFAULT_STAGES).join(", ")} menit sebelum imsak*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}autosahur on <kota>*`,
      `◦ *${prefix}autosahur off*`,
      `◦ *${prefix}autosahur jadwal* — lihat imsak hari ini`,
      `◦ *${prefix}autosahur menit 60 30 10*`,
    ]) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}autosahur on jakarta`,
      `◦ ${prefix}autosahur on tangerang selatan`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Jadwal imsak diambil otomatis sesuai kota")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const groupId = m.chat;
    const cfg = getConfig(db, groupId);

    if (!sub || sub === "status") {
      await m.reply(helpText(prefix, cfg));
      return { handled: true };
    }

    /* --- on --- */
    if (sub === "on" || sub === "aktif") {
      if (!isGroupAdmin(m)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa mengatur ini."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Minta bantuan admin grup")
        );
        return { handled: true };
      }

      const kota = args.slice(1).join(" ").trim();
      if (!kota) {
        await m.reply(
          alyaHeader("Kota Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}autosahur on jakarta*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Sebutkan nama kota/kabupaten")
        );
        return { handled: true };
      }

      const found = await searchKota(kota);
      if (!found) {
        await m.reply(
          alyaHeader("Kota Tidak Ditemukan", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Kota *${kota}* tidak ditemukan.`,
              "◦ Coba nama kota/kabupaten lain.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Contoh: jakarta, bandung, tangerang")
        );
        return { handled: true };
      }

      setConfig(db, groupId, {
        enabled: true,
        kotaId: found.id,
        kotaName: found.lokasi || kota,
        stages: cfg?.stages || DEFAULT_STAGES,
      });

      await m.reply(
        alyaHeader("Auto Sahur Aktif", "🌙") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Kota: *${found.lokasi || kota}*`,
            `◦ Pengingat: *${(cfg?.stages || DEFAULT_STAGES).join(", ")} menit sebelum imsak*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}autosahur jadwal untuk lihat imsak hari ini`)
      );
      return { handled: true };
    }

    /* --- off --- */
    if (sub === "off" || sub === "nonaktif" || sub === "mati") {
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
      setConfig(db, groupId, null);
      await m.reply(
        alyaHeader("Auto Sahur", "🌙") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", ["◦ Auto sahur *dinonaktifkan* di grup ini."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}autosahur on <kota> untuk mengaktifkan lagi`)
      );
      return { handled: true };
    }

    /* --- jadwal --- */
    if (sub === "jadwal" || sub === "imsak") {
      if (!cfg?.kotaId) {
        await m.reply(helpText(prefix, cfg));
        return { handled: true };
      }
      const jadwal = await getTodaySchedule(cfg.kotaId);
      const t = extractPrayerTimes(jadwal);
      await m.reply(
        alyaHeader("Jadwal Hari Ini", "🕌") +
          "\n\n" +
          bracketBox("📍", "ᴋᴏᴛᴀ", [`◦ ${cfg.kotaName}`]) +
          "\n\n" +
          bracketBox("🕌", "ᴡᴀᴋᴛᴜ", [
            `◦ Imsak: *${t.imsak}*`,
            `◦ Subuh: *${t.subuh}*`,
            `◦ Dzuhur: *${t.dzuhur}*`,
            `◦ Ashar: *${t.ashar}*`,
            `◦ Maghrib: *${t.maghrib}*`,
            `◦ Isya: *${t.isya}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Sumber: api.myquran.com")
      );
      return { handled: true };
    }

    /* --- menit --- */
    if (sub === "menit" || sub === "stage" || sub === "tahap") {
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

      const stages = args
        .slice(1)
        .map((x) => parseInt(x, 10))
        .filter((x) => Number.isFinite(x) && x > 0 && x <= 180);

      if (!stages.length) {
        await m.reply(
          alyaHeader("Format Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Contoh: *${prefix}autosahur menit 60 30 10*`,
              "◦ Nilai 1-180 menit sebelum imsak.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Boleh lebih dari satu tahap")
        );
        return { handled: true };
      }

      setConfig(db, groupId, {
        ...(cfg || { enabled: false }),
        stages: [...new Set(stages)].sort((a, b) => b - a),
      });

      await m.reply(
        alyaHeader("Tahap Pengingat", "⏰") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Pengingat: *${[...new Set(stages)].sort((a, b) => b - a).join(", ")} menit sebelum imsak*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}autosahur status untuk detail`)
      );
      return { handled: true };
    }

    await m.reply(helpText(prefix, cfg));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}autosahur untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export {
  initSahurCron,
  startSahurChecker,
  stopSahurChecker,
  checkAll,
  toMinutes,
  getConfig,
  setConfig,
  DEFAULT_STAGES,
};
