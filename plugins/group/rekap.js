/**
 * Rekap Aktivitas Grup
 * ---------------------------------------------------------------
 * Mencatat jumlah pesan per member per hari, lalu menampilkan
 * papan peringkat harian / mingguan dan anggota paling pendiam.
 *
 * Penyimpanan dirancang hemat: hanya hitungan angka per hari,
 * bukan isi pesan. Data lebih dari RETENSI_HARI otomatis dipangkas.
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
  todayKey,
} from "../../src/lib/clara-group-util.js";

const KEY = "rekapAktivitas";
const RETENSI_HARI = 8;

/* ------------------------------------------------------------------ */
/* Pencatatan                                                          */
/* ------------------------------------------------------------------ */

/** Buang hari yang lebih tua dari RETENSI_HARI. */
function pangkas(data) {
  const hari = Object.keys(data.harian || {}).sort();
  while (hari.length > RETENSI_HARI) {
    delete data.harian[hari.shift()];
  }
  return data;
}

/**
 * Catat satu pesan. Dipanggil dari handler untuk tiap pesan grup.
 * Sengaja ringan: satu increment, tanpa isi pesan.
 */
async function catatPesan(m, db) {
  try {
    if (!m?.isGroup) return false;
    const sender = num(m.sender);
    if (!sender) return false;

    const data = readGroupState(db, KEY, m.chat, null) || { harian: {}, nama: {} };
    data.harian = data.harian || {};
    data.nama = data.nama || {};

    const hari = todayKey();
    data.harian[hari] = data.harian[hari] || {};
    data.harian[hari][sender] = (data.harian[hari][sender] || 0) + 1;
    if (m.pushName) data.nama[sender] = String(m.pushName).slice(0, 30);

    pangkas(data);
    writeGroupState(db, KEY, m.chat, data);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Agregasi                                                            */
/* ------------------------------------------------------------------ */

/** Gabung hitungan beberapa hari terakhir. */
function agregat(data, jumlahHari = 1) {
  const hari = Object.keys(data.harian || {}).sort().slice(-jumlahHari);
  const total = {};
  for (const h of hari) {
    for (const [jid, n] of Object.entries(data.harian[h] || {})) {
      total[jid] = (total[jid] || 0) + n;
    }
  }
  return { total, hari };
}

function peringkat(total, nama, limit = 10) {
  return Object.entries(total)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([jid, n], i) => ({ rank: i + 1, jid, n, nama: nama[jid] || jid }));
}

function medali(rank) {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "rekap",
  alias: ["rekap", "aktivitas", "topchat", "statgrup", "chatstats"],
  category: "group",
  description: "Rekap aktivitas chat grup: paling aktif & paling pendiam",
  usage: ".rekap [hari|minggu|sepi|reset]",
  example: ".rekap hari",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function kosongText(prefix) {
  return (
    alyaHeader("Rekap Grup", "📊") +
    "\n\n" +
    bracketBox("📭", "ʙᴇʟᴜᴍ ᴀᴅᴀ ᴅᴀᴛᴀ", [
      "◦ Belum ada aktivitas tercatat.",
      "◦ Data mulai dikumpulkan sejak sekarang.",
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}rekap hari* — hari ini`,
      `◦ *${prefix}rekap minggu* — 7 hari`,
      `◦ *${prefix}rekap sepi* — paling pendiam`,
      `◦ *${prefix}rekap reset* — hapus (admin)`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Coba lagi setelah ada percakapan")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const sub = ((m.text || "").trim().split(/\s+/)[0] || "hari").toLowerCase();
    const data = readGroupState(db, KEY, m.chat, null);

    /* --- reset --- */
    if (["reset", "hapus", "clear"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa reset."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Minta bantuan admin")
        );
        return { handled: true };
      }
      writeGroupState(db, KEY, m.chat, null);
      await m.reply(
        alyaHeader("Rekap Direset", "🧹") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", ["◦ Semua data aktivitas grup dihapus."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Pencatatan dimulai dari nol")
      );
      return { handled: true };
    }

    if (!data || !Object.keys(data.harian || {}).length) {
      await m.reply(kosongText(prefix));
      return { handled: true };
    }

    const nama = data.nama || {};

    /* --- paling sepi --- */
    if (["sepi", "pendiam", "silent", "hantu"].includes(sub)) {
      const { total } = agregat(data, 7);
      const all = memberJids(m).map(num);

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

      const sepi = all
        .map((j) => ({ jid: j, n: total[j] || 0 }))
        .sort((a, b) => a.n - b.n)
        .slice(0, 15);

      await m.reply(
        alyaHeader("Paling Pendiam", "🤫") +
          "\n\n" +
          bracketBox("🤫", "7 ʜᴀʀɪ ᴛᴇʀᴀᴋʜɪʀ", sepi.map((s, i) => `◦ ${i + 1}. @${s.jid} — ${s.n} pesan`)) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [
            `◦ Total member: *${all.length}*`,
            `◦ Belum pernah chat: *${sepi.filter((s) => s.n === 0).length}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Sapa mereka biar grup makin hidup"),
        { mentions: sepi.map((s) => `${s.jid}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- harian / mingguan --- */
    const mingguan = ["minggu", "week", "7hari", "pekan"].includes(sub);
    const { total, hari } = agregat(data, mingguan ? 7 : 1);
    const list = peringkat(total, nama, 10);
    const totalPesan = Object.values(total).reduce((a, b) => a + b, 0);
    const totalOrang = Object.keys(total).length;

    if (!list.length) {
      await m.reply(kosongText(prefix));
      return { handled: true };
    }

    await m.reply(
      alyaHeader(mingguan ? "Rekap Mingguan" : "Rekap Hari Ini", "📊") +
        "\n\n" +
        bracketBox("🏆", "ᴘᴀʟɪɴɢ ᴀᴋᴛɪꜰ", list.map((r) => `◦ ${medali(r.rank)} ${r.nama} — ${r.n} pesan`)) +
        "\n\n" +
        bracketBox("📊", "ʀɪɴɢᴋᴀꜱᴀɴ", [
          `◦ Total pesan: *${totalPesan}*`,
          `◦ Member aktif: *${totalOrang}*`,
          `◦ Rentang: *${hari.length} hari*`,
          `◦ Rata-rata: *${Math.round(totalPesan / Math.max(1, hari.length))} pesan/hari*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(
          mingguan
            ? `${prefix}rekap hari untuk hari ini`
            : `${prefix}rekap minggu untuk 7 hari`
        )
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}rekap untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { catatPesan, agregat, peringkat, pangkas, RETENSI_HARI, KEY };
