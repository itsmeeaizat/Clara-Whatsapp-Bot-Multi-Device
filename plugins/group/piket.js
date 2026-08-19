// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Piket / Jadwal Giliran
 * ---------------------------------------------------------------
 * Daftar giliran bergilir untuk grup: piket kebersihan, giliran
 * jaga, rotasi presenter rapat, dsb.
 *
 * Giliran maju otomatis dengan .piket next, dan bot bisa
 * mengumumkan siapa yang bertugas hari ini.
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
  readGroupState,
  writeGroupState,
  todayKey,
} from "../../src/lib/clara-group-util.js";

const KEY = "piketGrup";
const MAX_ANGGOTA = 50;

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function defaultPiket() {
  return { judul: "Piket", anggota: [], index: 0, riwayat: [], lastAdvance: null };
}

function getPiket(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  if (!raw || typeof raw !== "object") return defaultPiket();
  return {
    judul: String(raw.judul || "Piket"),
    anggota: Array.isArray(raw.anggota) ? raw.anggota : [],
    index: Number.isInteger(raw.index) ? raw.index : 0,
    riwayat: Array.isArray(raw.riwayat) ? raw.riwayat : [],
    lastAdvance: raw.lastAdvance || null,
  };
}

function savePiket(db, groupId, p) {
  p.riwayat = p.riwayat.slice(-30);
  writeGroupState(db, KEY, groupId, p);
}

/** Siapa yang bertugas sekarang. */
function giliranSekarang(p) {
  if (!p.anggota.length) return null;
  const i = ((p.index % p.anggota.length) + p.anggota.length) % p.anggota.length;
  return p.anggota[i];
}

/** Beberapa giliran berikutnya. */
function giliranBerikut(p, jumlah = 3) {
  if (!p.anggota.length) return [];
  const out = [];
  for (let k = 1; k <= Math.min(jumlah, p.anggota.length); k++) {
    const i = (p.index + k) % p.anggota.length;
    out.push(p.anggota[i]);
  }
  return out;
}

function hariIni() {
  const n = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return HARI[n.getDay()];
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "piket",
  alias: ["piket", "giliran", "jadwalpiket", "rotasi", "duty"],
  category: "group",
  description: "Jadwal giliran bergilir: piket, jaga, atau rotasi tugas",
  usage: ".piket <set|tambah|hapus|now|next|list|reset>",
  example: ".piket tambah @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix, p) {
  return (
    alyaHeader("Piket Grup", "🧹") +
    "\n\n" +
    bracketBox("🧹", "ꜱᴛᴀᴛᴜꜱ", [
      `◦ Judul: *${p.judul}*`,
      `◦ Anggota: *${p.anggota.length} orang*`,
      p.anggota.length
        ? `◦ Giliran kini: @${giliranSekarang(p)}`
        : "◦ Belum ada anggota",
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}piket set <judul>*`,
      `◦ *${prefix}piket tambah @user*`,
      `◦ *${prefix}piket hapus @user*`,
      `◦ *${prefix}piket now* — siapa sekarang`,
      `◦ *${prefix}piket next* — maju giliran`,
      `◦ *${prefix}piket list* — urutan lengkap`,
      `◦ *${prefix}piket reset*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Tambah semua anggota lalu pakai next tiap giliran")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa mengatur piket."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}piket now untuk lihat giliran`)
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const p = getPiket(db, m.chat);

    /* --- set judul --- */
    if (sub === "set" || sub === "judul") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const judul = args.slice(1).join(" ").trim().slice(0, 40);
      if (!judul) {
        await m.reply(
          alyaHeader("Judul Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}piket set Piket Kebersihan*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Sebutkan judulnya")
        );
        return { handled: true };
      }
      p.judul = judul;
      savePiket(db, m.chat, p);
      await m.reply(
        alyaHeader("Judul Diset", "🧹") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Judul: *${judul}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}piket tambah @user untuk mengisi`)
      );
      return { handled: true };
    }

    /* --- tambah --- */
    if (["tambah", "add", "masuk"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };

      const targets = (m.mentionedJid || []).map(num).filter(Boolean);
      if (!targets.length) {
        await m.reply(
          alyaHeader("Target Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}piket tambah @user*`, "◦ Bisa mention beberapa sekaligus."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Mention anggota yang ditambahkan")
        );
        return { handled: true };
      }

      const baru = targets.filter((t) => !p.anggota.includes(t));
      if (p.anggota.length + baru.length > MAX_ANGGOTA) {
        await m.reply(
          alyaHeader("Terlalu Banyak", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ʙᴀᴛᴀꜱ", [`◦ Maksimal *${MAX_ANGGOTA}* anggota.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Hapus sebagian dulu")
        );
        return { handled: true };
      }

      p.anggota.push(...baru);
      savePiket(db, m.chat, p);

      await m.reply(
        alyaHeader("Anggota Ditambah", "➕") +
          "\n\n" +
          bracketBox("➕", "ʙᴀʀᴜ", baru.length ? baru.map((t) => `◦ @${t}`) : ["◦ Semua sudah terdaftar."]) +
          "\n\n" +
          bracketBox("📊", "ᴛᴏᴛᴀʟ", [`◦ *${p.anggota.length} anggota*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}piket list untuk urutan lengkap`),
        { mentions: baru.map((t) => `${t}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- hapus --- */
    if (["hapus", "keluar", "remove", "del"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const targets = (m.mentionedJid || []).map(num).filter(Boolean);
      if (!targets.length) {
        await m.reply(
          alyaHeader("Target Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}piket hapus @user*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Mention anggota yang dihapus")
        );
        return { handled: true };
      }

      const sebelum = p.anggota.length;
      const petugasLama = giliranSekarang(p);
      p.anggota = p.anggota.filter((a) => !targets.includes(a));

      // Jaga agar giliran tetap menunjuk orang yang sama bila masih ada
      if (petugasLama && p.anggota.includes(petugasLama)) {
        p.index = p.anggota.indexOf(petugasLama);
      } else if (p.anggota.length) {
        p.index = p.index % p.anggota.length;
      } else {
        p.index = 0;
      }
      savePiket(db, m.chat, p);

      await m.reply(
        alyaHeader("Anggota Dihapus", "➖") +
          "\n\n" +
          bracketBox("➖", "ᴅɪʜᴀᴘᴜꜱ", [`◦ *${sebelum - p.anggota.length}* anggota`]) +
          "\n\n" +
          bracketBox("📊", "ᴛᴏᴛᴀʟ", [
            `◦ Sisa: *${p.anggota.length} anggota*`,
            p.anggota.length ? `◦ Giliran kini: @${giliranSekarang(p)}` : "◦ Daftar kosong",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}piket list untuk urutan lengkap`),
        { mentions: p.anggota.length ? [`${giliranSekarang(p)}@s.whatsapp.net`] : [] }
      );
      return { handled: true };
    }

    /* --- now --- */
    if (!sub || ["now", "siapa", "sekarang", "cek"].includes(sub)) {
      if (!p.anggota.length) {
        await m.reply(helpText(prefix, p));
        return { handled: true };
      }
      const kini = giliranSekarang(p);
      const next = giliranBerikut(p, 3);

      await m.reply(
        alyaHeader(p.judul, "🧹") +
          "\n\n" +
          bracketBox("👤", "ɢɪʟɪʀᴀɴ ꜱᴇᴋᴀʀᴀɴɢ", [`◦ @${kini}`, `◦ Hari: *${hariIni()}*`]) +
          "\n\n" +
          bracketBox("⏭️", "ʙᴇʀɪᴋᴜᴛɴʏᴀ", next.map((n2, i) => `◦ ${i + 1}. @${n2}`)) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}piket next untuk memajukan giliran`),
        { mentions: [kini, ...next].map((x) => `${x}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- next --- */
    if (["next", "lanjut", "maju", "ganti"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      if (!p.anggota.length) {
        await m.reply(helpText(prefix, p));
        return { handled: true };
      }

      const selesai = giliranSekarang(p);
      p.index = (p.index + 1) % p.anggota.length;
      p.lastAdvance = todayKey();
      p.riwayat.push({ jid: selesai, at: Date.now() });
      savePiket(db, m.chat, p);

      const kini = giliranSekarang(p);
      await m.reply(
        alyaHeader("Giliran Maju", "⏭️") +
          "\n\n" +
          bracketBox("✅", "ꜱᴇʟᴇꜱᴀɪ", [`◦ @${selesai} sudah bertugas`]) +
          "\n\n" +
          bracketBox("👤", "ɢɪʟɪʀᴀɴ ʙᴀʀᴜ", [`◦ @${kini}`, `◦ Tugas: *${p.judul}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Selamat bertugas"),
        { mentions: [`${selesai}@s.whatsapp.net`, `${kini}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- list --- */
    if (["list", "daftar", "urutan"].includes(sub)) {
      if (!p.anggota.length) {
        await m.reply(helpText(prefix, p));
        return { handled: true };
      }
      const kiniIdx = p.index % p.anggota.length;
      const lines = p.anggota
        .slice(0, 40)
        .map((a, i) => `${i === kiniIdx ? "▶" : "◦"} ${i + 1}. @${a}${i === kiniIdx ? " ← sekarang" : ""}`);

      await m.reply(
        alyaHeader(p.judul, "📋") +
          "\n\n" +
          bracketBox("👥", "ᴜʀᴜᴛᴀɴ", lines) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [
            `◦ Total: *${p.anggota.length} anggota*`,
            `◦ Sudah berputar: *${p.riwayat.length}x*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}piket next untuk memajukan`),
        { mentions: p.anggota.slice(0, 40).map((a) => `${a}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- reset --- */
    if (["reset", "kosongkan", "clear"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      writeGroupState(db, KEY, m.chat, null);
      await m.reply(
        alyaHeader("Piket Direset", "🧹") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", ["◦ Semua data piket dihapus."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}piket tambah @user untuk mulai lagi`)
      );
      return { handled: true };
    }

    await m.reply(helpText(prefix, p));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}piket untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { giliranSekarang, giliranBerikut, getPiket, savePiket, KEY };
