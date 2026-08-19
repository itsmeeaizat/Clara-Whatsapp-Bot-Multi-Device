// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Spam Guard
 * ---------------------------------------------------------------
 * Deteksi flood/spam yang benar-benar bekerja.
 *
 * Plugin .antispam yang sudah ada hanya menyalakan flag di database —
 * tidak ada satu pun kode yang membaca flag itu, jadi tidak pernah ada
 * yang terdeteksi. Plugin ini menyediakan logikanya.
 *
 * Tiga jenis deteksi:
 *   1. Flood    - terlalu banyak pesan dalam jendela waktu singkat
 *   2. Duplikat - pesan sama diulang berkali-kali
 *   3. Panjang  - pesan sangat panjang (copas masal)
 *
 * Hitungan disimpan di memori (bukan database) supaya ringan dan
 * otomatis bersih saat bot restart.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  num,
  isAdmin,
  isBotAdmin,
  readGroupState,
  writeGroupState,
} from "../../src/lib/clara-group-util.js";

const KEY = "spamGuard";

const DEFAULT = {
  enabled: false,
  maksPesan: 5, // jumlah pesan
  jendela: 7, // dalam detik
  maksDuplikat: 3, // pesan identik berturut-turut
  maksPanjang: 3000, // karakter
  aksi: "warn", // warn | delete | kick
};

/** Riwayat per (grup:user) — hanya di memori. */
const riwayat = new Map();
const RIWAYAT_MAKS = 5000;

/* ------------------------------------------------------------------ */
/* Konfigurasi                                                         */
/* ------------------------------------------------------------------ */

function getCfg(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  if (!raw || typeof raw !== "object") return { ...DEFAULT };
  return {
    enabled: raw.enabled === true,
    maksPesan: clampInt(raw.maksPesan, 2, 30, DEFAULT.maksPesan),
    jendela: clampInt(raw.jendela, 2, 120, DEFAULT.jendela),
    maksDuplikat: clampInt(raw.maksDuplikat, 2, 20, DEFAULT.maksDuplikat),
    maksPanjang: clampInt(raw.maksPanjang, 200, 20000, DEFAULT.maksPanjang),
    aksi: ["warn", "delete", "kick"].includes(raw.aksi) ? raw.aksi : DEFAULT.aksi,
  };
}

function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function saveCfg(db, groupId, cfg) {
  writeGroupState(db, KEY, groupId, cfg.enabled ? cfg : null);
}

/* ------------------------------------------------------------------ */
/* Deteksi                                                             */
/* ------------------------------------------------------------------ */

/**
 * Periksa satu pesan.
 * @returns {null|{jenis:string,detail:string,hits:number}}
 */
function periksa(groupId, sender, teks, cfg, now = Date.now()) {
  const key = `${groupId}:${sender}`;
  let r = riwayat.get(key);
  if (!r) {
    r = { waktu: [], terakhir: "", ulang: 0 };
    // Jaga agar Map tidak tumbuh tanpa batas di bot dengan banyak grup
    if (riwayat.size >= RIWAYAT_MAKS) {
      const tertua = riwayat.keys().next().value;
      riwayat.delete(tertua);
    }
    riwayat.set(key, r);
  }

  // 1. Pesan terlalu panjang
  const panjang = String(teks || "").length;
  if (panjang > cfg.maksPanjang) {
    return { jenis: "panjang", detail: `${panjang} karakter`, hits: 1 };
  }

  // 2. Duplikat berturut-turut
  const norm = String(teks || "").trim().toLowerCase();
  if (norm && norm === r.terakhir) {
    r.ulang++;
    if (r.ulang >= cfg.maksDuplikat) {
      r.ulang = 0;
      return { jenis: "duplikat", detail: `${cfg.maksDuplikat}x pesan sama`, hits: cfg.maksDuplikat };
    }
  } else {
    r.terakhir = norm;
    r.ulang = 1;
  }

  // 3. Flood dalam jendela waktu
  const batas = now - cfg.jendela * 1000;
  r.waktu = r.waktu.filter((t) => t > batas);
  r.waktu.push(now);
  if (r.waktu.length > cfg.maksPesan) {
    const n = r.waktu.length;
    r.waktu = []; // reset supaya tidak memicu beruntun
    return { jenis: "flood", detail: `${n} pesan dalam ${cfg.jendela} detik`, hits: n };
  }

  return null;
}

/** Bersihkan riwayat satu grup (dipakai saat guard dimatikan). */
function resetRiwayat(groupId) {
  for (const k of [...riwayat.keys()]) {
    if (k.startsWith(`${groupId}:`)) riwayat.delete(k);
  }
}

/* ------------------------------------------------------------------ */
/* Penindakan                                                          */
/* ------------------------------------------------------------------ */

/**
 * Dipanggil handler untuk setiap pesan grup.
 * @returns {Promise<boolean>} true bila pesan ditindak
 */
async function cekSpam(m, sock, db) {
  try {
    if (!m?.isGroup) return false;
    if (m.isOwner || m.isAdmin) return false; // admin & owner bebas

    const cfg = getCfg(db, m.chat);
    if (!cfg.enabled) return false;

    const hasil = periksa(m.chat, num(m.sender), m.text || "", cfg);
    if (!hasil) return false;

    const nomor = num(m.sender);
    const labelJenis =
      hasil.jenis === "flood" ? "Flood" : hasil.jenis === "duplikat" ? "Pesan Berulang" : "Pesan Terlalu Panjang";

    // Aksi: hapus pesan
    if (cfg.aksi === "delete" && isBotAdmin(m)) {
      try {
        await sock.sendMessage(m.chat, { delete: m.key });
      } catch {
        // gagal hapus bukan alasan berhenti
      }
    }

    // Aksi: kick
    if (cfg.aksi === "kick" && isBotAdmin(m)) {
      try {
        await sock.groupParticipantsUpdate(m.chat, [`${nomor}@s.whatsapp.net`], "remove");
        await sock.sendMessage(m.chat, {
          text:
            alyaHeader("Spam Terdeteksi", "🚨") +
            "\n\n" +
            bracketBox("🚨", "ᴅɪᴋᴇʟᴜᴀʀᴋᴀɴ", [
              `◦ Member: @${nomor}`,
              `◦ Jenis: *${labelJenis}*`,
              `◦ Detail: *${hasil.detail}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Spam guard aktif di grup ini"),
          mentions: [`${nomor}@s.whatsapp.net`],
        });
        return true;
      } catch {
        // jatuh ke peringatan biasa
      }
    }

    // Default: peringatan
    await sock.sendMessage(m.chat, {
      text:
        alyaHeader("Spam Terdeteksi", "🚨") +
        "\n\n" +
        bracketBox("⚠️", "ᴘᴇʀɪɴɢᴀᴛᴀɴ", [
          `◦ Member: @${nomor}`,
          `◦ Jenis: *${labelJenis}*`,
          `◦ Detail: *${hasil.detail}*`,
          "◦ Mohon kurangi ya.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Terus mengulang bisa dikeluarkan"),
      mentions: [`${nomor}@s.whatsapp.net`],
    });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "spamguard",
  alias: ["spamguard", "antiflood", "floodguard", "antispam2"],
  category: "group",
  description: "Deteksi flood, pesan berulang, dan pesan kepanjangan",
  usage: ".spamguard <on/off/limit/aksi>",
  example: ".spamguard on",
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
    alyaHeader("Spam Guard", "🛡️") +
    "\n\n" +
    bracketBox("🛡️", "ꜱᴛᴀᴛᴜꜱ", [
      `◦ Aktif: *${cfg.enabled ? "ya" : "tidak"}*`,
      `◦ Aksi: *${cfg.aksi}*`,
    ]) +
    "\n\n" +
    bracketBox("⚙️", "ᴀᴍʙᴀɴɢ ʙᴀᴛᴀꜱ", [
      `◦ Maks *${cfg.maksPesan}* pesan / *${cfg.jendela}* detik`,
      `◦ Maks *${cfg.maksDuplikat}x* pesan sama`,
      `◦ Maks *${cfg.maksPanjang}* karakter`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}spamguard on / off*`,
      `◦ *${prefix}spamguard limit 5 7* — pesan & detik`,
      `◦ *${prefix}spamguard duplikat 3*`,
      `◦ *${prefix}spamguard panjang 3000*`,
      `◦ *${prefix}spamguard aksi warn|delete|kick*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Admin & owner tidak pernah kena filter")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa mengatur ini."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}spamguard untuk lihat status`)
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const cfg = getCfg(db, m.chat);

    if (!sub || sub === "status") {
      await m.reply(statusText(prefix, cfg));
      return { handled: true };
    }

    if (sub === "on" || sub === "off") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      cfg.enabled = sub === "on";
      saveCfg(db, m.chat, cfg);
      if (!cfg.enabled) resetRiwayat(m.chat);

      await m.reply(
        alyaHeader("Spam Guard", "🛡️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Status: *${cfg.enabled ? "AKTIF" : "NONAKTIF"}*`,
            cfg.enabled
              ? `◦ Aksi saat terdeteksi: *${cfg.aksi}*`
              : "◦ Riwayat pemantauan dibersihkan.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(cfg.enabled ? `${prefix}spamguard limit untuk atur ambang` : "Aktifkan lagi kapan saja")
      );
      return { handled: true };
    }

    if (sub === "limit") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const pesan = parseInt(args[1], 10);
      const detik = parseInt(args[2], 10);
      if (!Number.isFinite(pesan) || !Number.isFinite(detik)) {
        await m.reply(
          alyaHeader("Format Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Contoh: *${prefix}spamguard limit 5 7*`,
              "◦ Artinya maks 5 pesan per 7 detik.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Pesan 2-30 · detik 2-120")
        );
        return { handled: true };
      }
      cfg.maksPesan = clampInt(pesan, 2, 30, DEFAULT.maksPesan);
      cfg.jendela = clampInt(detik, 2, 120, DEFAULT.jendela);
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Ambang Diubah", "⚙️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Maks *${cfg.maksPesan}* pesan / *${cfg.jendela}* detik`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}spamguard untuk lihat semua`)
      );
      return { handled: true };
    }

    if (sub === "duplikat" || sub === "ulang") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      cfg.maksDuplikat = clampInt(args[1], 2, 20, DEFAULT.maksDuplikat);
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Ambang Diubah", "⚙️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Maks *${cfg.maksDuplikat}x* pesan sama berturut-turut`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}spamguard untuk lihat semua`)
      );
      return { handled: true };
    }

    if (sub === "panjang") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      cfg.maksPanjang = clampInt(args[1], 200, 20000, DEFAULT.maksPanjang);
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Ambang Diubah", "⚙️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Maks *${cfg.maksPanjang}* karakter per pesan`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}spamguard untuk lihat semua`)
      );
      return { handled: true };
    }

    if (sub === "aksi") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const a = (args[1] || "").toLowerCase();
      if (!["warn", "delete", "kick"].includes(a)) {
        await m.reply(
          alyaHeader("Aksi Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ᴘɪʟɪʜᴀɴ", [
              "◦ *warn* — beri peringatan",
              "◦ *delete* — hapus pesannya",
              "◦ *kick* — keluarkan pengirim",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Contoh: ${prefix}spamguard aksi delete`)
        );
        return { handled: true };
      }
      cfg.aksi = a;
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Aksi Diubah", "⚙️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Aksi: *${a}*`,
            a !== "warn" ? "◦ Bot harus admin agar bisa dijalankan." : "◦ Tidak butuh bot admin.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}spamguard untuk lihat semua`)
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
        tipText(`Ketik ${prefix}spamguard untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { cekSpam, periksa, getCfg, saveCfg, resetRiwayat, riwayat, DEFAULT, KEY };
