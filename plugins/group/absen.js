/**
 * Absen Grup
 * ---------------------------------------------------------------
 * Sesi absensi untuk grup: admin membuka sesi, member mengetik
 * "hadir" (atau kata kunci lain), lalu rekap bisa ditutup dan
 * dilihat siapa yang belum absen.
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
  memberJids,
  readGroupState,
  writeGroupState,
} from "../../src/lib/clara-group-util.js";

const KEY = "absenSesi";
const HADIR_WORDS = ["hadir", "absen", "present", "ada", "masuk"];

/* ------------------------------------------------------------------ */
/* Listener keyword                                                    */
/* ------------------------------------------------------------------ */

/**
 * Dipanggil dari handler untuk pesan non-command.
 * @returns {Promise<boolean>} true bila pesan ini tercatat sebagai absen
 */
async function tryAbsen(m, db) {
  try {
    if (!m?.isGroup) return false;
    const sesi = readGroupState(db, KEY, m.chat);
    if (!sesi || sesi.closed) return false;

    const word = String(m.text || "").trim().toLowerCase();
    if (!HADIR_WORDS.includes(word)) return false;

    const sender = num(m.sender);
    sesi.hadir = Array.isArray(sesi.hadir) ? sesi.hadir : [];
    if (sesi.hadir.some((h) => num(h.jid) === sender)) return false;

    sesi.hadir.push({
      jid: sender,
      nama: m.pushName || sender,
      at: Date.now(),
    });
    writeGroupState(db, KEY, m.chat, sesi);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "absen",
  alias: ["absen", "absensi", "rollcall", "presensi", "kehadiran"],
  category: "group",
  description: "Buka sesi absensi grup, member cukup ketik hadir",
  usage: ".absen buka <judul> | tutup | cek | belum",
  example: ".absen buka Rapat Mingguan",
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
    alyaHeader("Absen Grup", "📋") +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}absen buka <judul>* — mulai sesi`,
      `◦ *${prefix}absen cek* — lihat yang sudah hadir`,
      `◦ *${prefix}absen belum* — lihat yang belum`,
      `◦ *${prefix}absen tutup* — tutup & rekap`,
    ]) +
    "\n\n" +
    bracketBox("✋", "ᴄᴀʀᴀ ᴀʙꜱᴇɴ", [
      `◦ Ketik: *${HADIR_WORDS.slice(0, 3).join("* / *")}*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Hanya admin yang bisa membuka & menutup sesi")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa melakukan ini."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}absen untuk bantuan`)
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const sesi = readGroupState(db, KEY, m.chat);

    /* --- buka --- */
    if (["buka", "mulai", "start", "open"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(tolakAdmin(prefix));
        return { handled: true };
      }
      if (sesi && !sesi.closed) {
        await m.reply(
          alyaHeader("Sesi Berjalan", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Judul: *${sesi.judul}*`,
              `◦ Hadir: *${(sesi.hadir || []).length} orang*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}absen tutup untuk mengakhiri`)
        );
        return { handled: true };
      }

      const judul = args.slice(1).join(" ").trim() || "Absensi";
      writeGroupState(db, KEY, m.chat, {
        judul,
        by: num(m.sender),
        startedAt: Date.now(),
        hadir: [],
        closed: false,
      });

      await m.reply(
        alyaHeader("Absen Dibuka", "📋") +
          "\n\n" +
          bracketBox("📌", "ᴊᴜᴅᴜʟ", [`◦ ${judul}`]) +
          "\n\n" +
          bracketBox("✋", "ᴄᴀʀᴀ ɪᴋᴜᴛ", [
            `◦ Ketik: *${HADIR_WORDS.slice(0, 3).join("* / *")}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Dibuka oleh @${num(m.sender)}`),
        { mentions: [`${num(m.sender)}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- cek --- */
    if (["cek", "list", "lihat", "status"].includes(sub)) {
      if (!sesi) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      const hadir = sesi.hadir || [];
      const lines = hadir.length
        ? hadir.slice(0, 40).map((h, i) => `◦ ${i + 1}. ${h.nama}`)
        : ["◦ Belum ada yang absen."];

      await m.reply(
        alyaHeader("Daftar Hadir", "✅") +
          "\n\n" +
          bracketBox("📌", "ᴊᴜᴅᴜʟ", [`◦ ${sesi.judul}`]) +
          "\n\n" +
          bracketBox("✅", "ʜᴀᴅɪʀ", lines) +
          "\n\n" +
          bracketBox("📊", "ᴛᴏᴛᴀʟ", [
            `◦ *${hadir.length} orang*`,
            `◦ Status: *${sesi.closed ? "ditutup" : "masih dibuka"}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(hadir.length > 40 ? "Menampilkan 40 pertama" : "Semua tercatat")
      );
      return { handled: true };
    }

    /* --- belum absen --- */
    if (["belum", "absent", "bolos"].includes(sub)) {
      if (!sesi) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      const all = memberJids(m);
      if (!all.length) {
        await m.reply(
          alyaHeader("Data Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", ["◦ Data member grup tidak tersedia."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Coba lagi beberapa saat")
        );
        return { handled: true };
      }

      const sudah = new Set((sesi.hadir || []).map((h) => num(h.jid)));
      const belum = all.map(num).filter((n) => !sudah.has(n));
      const lines = belum.length
        ? belum.slice(0, 30).map((n, i) => `◦ ${i + 1}. @${n}`)
        : ["◦ Semua member sudah absen 🎉"];

      await m.reply(
        alyaHeader("Belum Absen", "⏳") +
          "\n\n" +
          bracketBox("📌", "ᴊᴜᴅᴜʟ", [`◦ ${sesi.judul}`]) +
          "\n\n" +
          bracketBox("⏳", "ʙᴇʟᴜᴍ", lines) +
          "\n\n" +
          bracketBox("📊", "ᴛᴏᴛᴀʟ", [
            `◦ Belum: *${belum.length}*`,
            `◦ Sudah: *${sudah.size}* dari *${all.length}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Mention otomatis agar mereka sadar"),
        { mentions: belum.slice(0, 30).map((n) => `${n}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- tutup --- */
    if (["tutup", "selesai", "close", "stop", "akhiri"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(tolakAdmin(prefix));
        return { handled: true };
      }
      if (!sesi) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }

      const hadir = sesi.hadir || [];
      const all = memberJids(m);
      const sudah = new Set(hadir.map((h) => num(h.jid)));
      const belum = all.map(num).filter((n) => !sudah.has(n));
      const durasi = Math.max(0, Date.now() - (sesi.startedAt || Date.now()));
      const menit = Math.floor(durasi / 60000);

      writeGroupState(db, KEY, m.chat, null);

      await m.reply(
        alyaHeader("Rekap Absen", "📊") +
          "\n\n" +
          bracketBox("📌", "ᴊᴜᴅᴜʟ", [`◦ ${sesi.judul}`]) +
          "\n\n" +
          bracketBox("✅", "ʜᴀᴅɪʀ", [
            `◦ *${hadir.length} orang*`,
            ...hadir.slice(0, 20).map((h, i) => `◦ ${i + 1}. ${h.nama}`),
          ]) +
          "\n\n" +
          bracketBox("📊", "ʀɪɴɢᴋᴀꜱᴀɴ", [
            `◦ Total member: *${all.length || "-"}*`,
            `◦ Tidak absen: *${all.length ? belum.length : "-"}*`,
            `◦ Durasi sesi: *${menit} menit*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Sesi absen ditutup")
      );
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
        tipText(`Ketik ${prefix}absen untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { tryAbsen, HADIR_WORDS, KEY };
