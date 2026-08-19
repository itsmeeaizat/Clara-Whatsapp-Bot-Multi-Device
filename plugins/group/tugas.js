// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Tugas / Deadline
 * ---------------------------------------------------------------
 * Pencatat tugas bersama untuk grup kelas atau kerja. Menampilkan
 * sisa waktu, menandai yang mendesak, dan bisa dicentang selesai.
 *
 *   .tugas tambah 3h Matematika bab 5
 *   .tugas                       daftar yang belum selesai
 *   .tugas selesai 1
 *   .tugas hapus 1
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
  humanDuration,
} from "../../src/lib/clara-group-util.js";

const KEY = "tugasGrup";
const MAX_TUGAS = 50;

/* ------------------------------------------------------------------ */
/* Waktu                                                               */
/* ------------------------------------------------------------------ */

/**
 * Parse tenggat: "3h" (3 hari), "5j" (5 jam), "30m", atau
 * tanggal "25/12" / "25-12-2026".
 * @returns {number|null} timestamp
 */
function parseTenggat(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return null;

  // Format relatif: 30m / 5j / 3h / 2mgg
  const rel = raw.match(/^(\d+)(m|j|jam|h|hari|d|mgg|minggu)$/);
  if (rel) {
    const n = parseInt(rel[1], 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    const unit = rel[2];
    const ms =
      unit === "m"
        ? 60_000
        : unit === "j" || unit === "jam"
          ? 3600_000
          : unit === "mgg" || unit === "minggu"
            ? 7 * 86400_000
            : 86400_000;
    const total = n * ms;
    return total <= 365 * 86400_000 ? Date.now() + total : null;
  }

  // Format tanggal: 25/12 atau 25-12-2026
  const tgl = raw.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?$/);
  if (tgl) {
    const hari = parseInt(tgl[1], 10);
    const bulan = parseInt(tgl[2], 10);
    if (hari < 1 || hari > 31 || bulan < 1 || bulan > 12) return null;

    const sekarang = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );
    const tahun = tgl[3] ? parseInt(tgl[3], 10) : sekarang.getFullYear();

    // Pukul 23:59 WIB = 16:59 UTC pada hari yang sama
    const target = new Date(Date.UTC(tahun, bulan - 1, hari, 16, 59, 0));
    if (isNaN(target.getTime())) return null;

    // Tanpa tahun eksplisit dan sudah lewat -> anggap tahun depan
    if (!tgl[3] && target.getTime() < Date.now()) {
      target.setUTCFullYear(tahun + 1);
    }
    return target.getTime();
  }

  return null;
}

function statusTenggat(at) {
  const sisa = at - Date.now();
  if (sisa <= 0) return { ikon: "🔴", label: "LEWAT", sisa };
  if (sisa < 86400_000) return { ikon: "🟠", label: "HARI INI", sisa };
  if (sisa < 3 * 86400_000) return { ikon: "🟡", label: "SEGERA", sisa };
  return { ikon: "🟢", label: "AMAN", sisa };
}

function tanggalId(ts) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getAll(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  return Array.isArray(raw) ? raw : [];
}

function saveAll(db, groupId, list) {
  writeGroupState(db, KEY, groupId, list.length ? list.slice(0, MAX_TUGAS) : null);
}

/** Urut: belum selesai dulu, lalu tenggat terdekat. */
function urutkan(list) {
  return [...list].sort((a, b) => {
    if (a.selesai !== b.selesai) return a.selesai ? 1 : -1;
    return a.at - b.at;
  });
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "tugas",
  alias: ["todo", "deadline", "pr", "tugasku", "tasklist"],
  category: "group",
  description: "Catat tugas & deadline bersama, lengkap dengan sisa waktu",
  usage: ".tugas [tambah <tenggat> <judul>|selesai <no>|hapus <no>]",
  example: ".tugas tambah 3h Matematika bab 5",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix, jumlah) {
  return (
    alyaHeader("Tugas Grup", "📚") +
    "\n\n" +
    bracketBox("📚", "ɪɴꜰᴏ", [
      "◦ Catat tugas & deadline bersama.",
      `◦ Tersimpan: *${jumlah} tugas*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}tugas tambah <tenggat> <judul>*`,
      `◦ *${prefix}tugas* — daftar belum selesai`,
      `◦ *${prefix}tugas semua* — termasuk selesai`,
      `◦ *${prefix}tugas selesai <no>*`,
      `◦ *${prefix}tugas hapus <no>*`,
      `◦ *${prefix}tugas bersih* — buang yang selesai`,
    ]) +
    "\n\n" +
    bracketBox("⏰", "ꜰᴏʀᴍᴀᴛ ᴛᴇɴɢɢᴀᴛ", [
      "◦ *30m* · *5j* · *3h* · *2mgg*",
      "◦ *25/12* atau *25-12-2026*",
    ]) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}tugas tambah 3h Matematika bab 5`,
      `◦ ${prefix}tugas tambah 25/12 Laporan akhir`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Semua member boleh menambah · hapus khusus admin/pembuat")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const list = getAll(db, m.chat);

    /* --- tambah --- */
    if (["tambah", "add", "baru", "new"].includes(sub)) {
      const tenggat = parseTenggat(args[1]);
      const judul = args.slice(2).join(" ").trim();

      if (!tenggat || !judul) {
        await m.reply(
          alyaHeader("Format Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ *${prefix}tugas tambah <tenggat> <judul>*`,
              `◦ Contoh: *${prefix}tugas tambah 3h Matematika*`,
            ]) +
            "\n\n" +
            bracketBox("⏰", "ᴛᴇɴɢɢᴀᴛ", ["◦ 30m · 5j · 3h · 2mgg · 25/12"]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Tenggat maksimal 1 tahun"),
        );
        return { handled: true };
      }

      if (list.length >= MAX_TUGAS) {
        await m.reply(
          alyaHeader("Penuh", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ʙᴀᴛᴀꜱ", [
              `◦ Maksimal *${MAX_TUGAS}* tugas per grup.`,
              `◦ Bersihkan dulu: *${prefix}tugas bersih*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Hapus tugas lama terlebih dahulu"),
        );
        return { handled: true };
      }

      list.push({
        judul: judul.slice(0, 120),
        at: tenggat,
        oleh: num(m.sender),
        nama: m.pushName || num(m.sender),
        selesai: false,
        dibuat: Date.now(),
      });
      saveAll(db, m.chat, list);

      const st = statusTenggat(tenggat);
      await m.reply(
        alyaHeader("Tugas Ditambah", "📝") +
          "\n\n" +
          bracketBox("📌", "ᴅᴇᴛᴀɪʟ", [
            `◦ Judul: *${judul.slice(0, 60)}*`,
            `◦ Tenggat: *${tanggalId(tenggat)}*`,
            `◦ Sisa: *${humanDuration(st.sisa)}* ${st.ikon}`,
            `◦ Dicatat oleh: @${num(m.sender)}`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}tugas untuk melihat semua`),
        { mentions: [`${num(m.sender)}@s.whatsapp.net`] },
      );
      return { handled: true };
    }

    /* --- selesai --- */
    if (["selesai", "done", "centang", "beres"].includes(sub)) {
      const urut = urutkan(list);
      const idx = parseInt(args[1], 10) - 1;

      if (!Number.isInteger(idx) || idx < 0 || idx >= urut.length) {
        await m.reply(
          alyaHeader("Nomor Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Nomor 1 sampai ${urut.length || 0}.`,
              `◦ Contoh: *${prefix}tugas selesai 1*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}tugas untuk lihat nomor`),
        );
        return { handled: true };
      }

      const t = urut[idx];
      if (t.selesai) {
        await m.reply(
          alyaHeader("Sudah Selesai", "ℹ️") +
            "\n\n" +
            bracketBox("ℹ️", "ɪɴꜰᴏ", [`◦ *${t.judul.slice(0, 60)}* sudah ditandai selesai.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Tidak ada yang perlu diubah"),
        );
        return { handled: true };
      }

      t.selesai = true;
      t.selesaiOleh = num(m.sender);
      t.selesaiAt = Date.now();
      saveAll(db, m.chat, list);

      const sisaBelum = list.filter((x) => !x.selesai).length;
      await m.reply(
        alyaHeader("Tugas Selesai", "✅") +
          "\n\n" +
          bracketBox("✅", "ꜱᴇʟᴇꜱᴀɪ", [
            `◦ *${t.judul.slice(0, 60)}*`,
            `◦ Ditandai oleh: @${num(m.sender)}`,
            `◦ Sisa belum selesai: *${sisaBelum}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(sisaBelum ? "Semangat menyelesaikan sisanya" : "Semua tugas beres 🎉"),
        { mentions: [`${num(m.sender)}@s.whatsapp.net`] },
      );
      return { handled: true };
    }

    /* --- hapus --- */
    if (["hapus", "del", "delete", "buang"].includes(sub)) {
      const urut = urutkan(list);
      const idx = parseInt(args[1], 10) - 1;

      if (!Number.isInteger(idx) || idx < 0 || idx >= urut.length) {
        await m.reply(
          alyaHeader("Nomor Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Nomor 1 sampai ${urut.length || 0}.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}tugas untuk lihat nomor`),
        );
        return { handled: true };
      }

      const t = urut[idx];
      // Hanya admin atau pencatatnya yang boleh menghapus
      if (!isAdmin(m) && t.oleh !== num(m.sender)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", [
              "◦ Hanya admin atau pencatat tugas",
              "  yang boleh menghapus.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}tugas selesai <no> untuk menandai beres`),
        );
        return { handled: true };
      }

      saveAll(db, m.chat, list.filter((x) => x !== t));
      await m.reply(
        alyaHeader("Tugas Dihapus", "🗑️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ *${t.judul.slice(0, 60)}* dihapus.`,
            `◦ Sisa: *${list.length - 1} tugas*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}tugas untuk daftar terbaru`),
      );
      return { handled: true };
    }

    /* --- bersihkan yang selesai --- */
    if (["bersih", "clear", "cleanup"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa membersihkan."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Minta bantuan admin"),
        );
        return { handled: true };
      }
      const sisa = list.filter((x) => !x.selesai);
      const dibuang = list.length - sisa.length;
      saveAll(db, m.chat, sisa);

      await m.reply(
        alyaHeader("Dibersihkan", "🧹") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Dibuang: *${dibuang} tugas selesai*`,
            `◦ Tersisa: *${sisa.length} tugas*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Daftar jadi lebih rapi"),
      );
      return { handled: true };
    }

    /* --- daftar --- */
    const tampilSemua = ["semua", "all"].includes(sub);
    const urut = urutkan(list);
    const tampil = tampilSemua ? urut : urut.filter((t) => !t.selesai);

    if (!tampil.length) {
      if (!list.length) {
        await m.reply(helpText(prefix, 0));
      } else {
        await m.reply(
          alyaHeader("Semua Beres", "🎉") +
            "\n\n" +
            bracketBox("✅", "ɪɴꜰᴏ", [
              "◦ Tidak ada tugas yang belum selesai.",
              `◦ Total selesai: *${list.length}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}tugas semua untuk lihat riwayat`),
        );
      }
      return { handled: true };
    }

    const lines = tampil.slice(0, 20).map((t, i) => {
      const nomorAsli = urut.indexOf(t) + 1;
      if (t.selesai) return `◦ ${nomorAsli}. ✅ ~${t.judul.slice(0, 34)}~`;
      const st = statusTenggat(t.at);
      const sisaTeks = st.sisa > 0 ? humanDuration(st.sisa) + " lagi" : "TERLAMBAT";
      return `◦ ${nomorAsli}. ${st.ikon} *${t.judul.slice(0, 34)}*\n│     ${tanggalId(t.at)} · ${sisaTeks}`;
    });

    const belum = list.filter((t) => !t.selesai);
    const mendesak = belum.filter((t) => t.at - Date.now() < 86400_000).length;

    await m.reply(
      alyaHeader(tampilSemua ? "Semua Tugas" : "Tugas Aktif", "📚") +
        "\n\n" +
        bracketBox("📋", "ᴅᴀꜰᴛᴀʀ", lines) +
        "\n\n" +
        bracketBox("📊", "ʀɪɴɢᴋᴀꜱᴀɴ", [
          `◦ Belum selesai: *${belum.length}*`,
          `◦ Mendesak (<24 jam): *${mendesak}*`,
          `◦ Total tercatat: *${list.length}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`${prefix}tugas selesai <no> bila sudah beres`),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}tugas untuk bantuan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { parseTenggat, statusTenggat, urutkan, getAll, saveAll, KEY };
