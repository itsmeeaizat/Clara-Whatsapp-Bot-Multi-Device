/**
 * Izin / Ketidakhadiran
 * ---------------------------------------------------------------
 * Member mengajukan izin (sakit, dinas, cuti), admin menyetujui atau
 * menolak. Berguna untuk grup kelas, kantor, atau organisasi.
 *
 * Melengkapi .absen: absen mencatat yang hadir, izin mencatat yang
 * berhalangan beserta alasannya.
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

const KEY = "izinGrup";
const MAX_RIWAYAT = 200;
const JENIS = ["sakit", "dinas", "cuti", "telat", "lain"];

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getAll(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  return Array.isArray(raw) ? raw : [];
}

function saveAll(db, groupId, list) {
  const trimmed = list.slice(-MAX_RIWAYAT);
  writeGroupState(db, KEY, groupId, trimmed.length ? trimmed : null);
}

function labelStatus(s) {
  return s === "setuju" ? "✅ disetujui" : s === "tolak" ? "❌ ditolak" : "⏳ menunggu";
}

/** "YYYY-MM-DD" dalam zona WIB untuk timestamp apa pun. */
function tanggalKunci(ts) {
  const n = new Date(new Date(ts).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(
    n.getDate()
  ).padStart(2, "0")}`;
}

function tanggalId(ts) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "izin",
  alias: ["izin", "ijin", "absensakit", "permit", "cuti"],
  category: "group",
  description: "Ajukan izin tidak hadir, admin menyetujui atau menolak",
  usage: ".izin <jenis> <alasan> | list | setuju <no> | tolak <no>",
  example: ".izin sakit demam tinggi",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix, jumlahPending) {
  return (
    alyaHeader("Izin Grup", "📄") +
    "\n\n" +
    bracketBox("📄", "ᴀᴘᴀ ɪɴɪ", [
      "◦ Ajukan izin tidak hadir ke admin.",
      `◦ Menunggu persetujuan: *${jumlahPending}*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴜɴᴛᴜᴋ ᴍᴇᴍʙᴇʀ", [
      `◦ *${prefix}izin <jenis> <alasan>*`,
      `◦ *${prefix}izin saya* — riwayat sendiri`,
    ]) +
    "\n\n" +
    bracketBox("👮", "ᴜɴᴛᴜᴋ ᴀᴅᴍɪɴ", [
      `◦ *${prefix}izin list* — yang menunggu`,
      `◦ *${prefix}izin setuju <no>*`,
      `◦ *${prefix}izin tolak <no>*`,
      `◦ *${prefix}izin semua* — semua riwayat`,
    ]) +
    "\n\n" +
    bracketBox("🏷️", "ᴊᴇɴɪꜱ", [`◦ ${JENIS.join(" · ")}`]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Contoh: ${prefix}izin sakit demam tinggi`)
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const list = getAll(db, m.chat);
    const pending = list.filter((x) => x.status === "pending");

    /* --- list pending --- */
    if (["list", "daftar", "pending", "menunggu"].includes(sub)) {
      if (!pending.length) {
        await m.reply(
          alyaHeader("Tidak Ada Izin", "📭") +
            "\n\n" +
            bracketBox("📭", "ɪɴꜰᴏ", ["◦ Tidak ada pengajuan yang menunggu."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}izin semua untuk lihat riwayat`)
        );
        return { handled: true };
      }

      const lines = pending.slice(0, 20).map((x, i) => {
        return `◦ ${i + 1}. @${x.jid} — *${x.jenis}*\n│     ${String(x.alasan).slice(0, 40)} (${tanggalId(x.at)})`;
      });

      await m.reply(
        alyaHeader("Izin Menunggu", "⏳") +
          "\n\n" +
          bracketBox("⏳", "ᴘᴇɴɢᴀᴊᴜᴀɴ", lines) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [`◦ Total: *${pending.length}* menunggu`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}izin setuju <nomor> untuk memproses`),
        { mentions: pending.slice(0, 20).map((x) => `${x.jid}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- setuju / tolak --- */
    if (["setuju", "acc", "terima", "tolak", "reject"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa memproses izin."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Ketik ${prefix}izin untuk mengajukan`)
        );
        return { handled: true };
      }

      const idx = parseInt(args[1], 10) - 1;
      if (!Number.isInteger(idx) || idx < 0 || idx >= pending.length) {
        await m.reply(
          alyaHeader("Nomor Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Nomor 1 sampai ${pending.length || 0}.`,
              `◦ Contoh: *${prefix}izin ${sub} 1*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}izin list untuk lihat nomor`)
        );
        return { handled: true };
      }

      const target = pending[idx];
      const setuju = ["setuju", "acc", "terima"].includes(sub);
      target.status = setuju ? "setuju" : "tolak";
      target.olehAdmin = num(m.sender);
      target.diprosesAt = Date.now();
      saveAll(db, m.chat, list);

      await m.reply(
        alyaHeader(setuju ? "Izin Disetujui" : "Izin Ditolak", setuju ? "✅" : "❌") +
          "\n\n" +
          bracketBox(setuju ? "✅" : "❌", "ᴋᴇᴘᴜᴛᴜꜱᴀɴ", [
            `◦ Member: @${target.jid}`,
            `◦ Jenis: *${target.jenis}*`,
            `◦ Alasan: *${String(target.alasan).slice(0, 60)}*`,
            `◦ Diproses oleh: @${num(m.sender)}`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(setuju ? "Semoga lekas pulih / lancar" : "Silakan koordinasi dengan admin"),
        {
          mentions: [
            `${target.jid}@s.whatsapp.net`,
            `${num(m.sender)}@s.whatsapp.net`,
          ],
        }
      );
      return { handled: true };
    }

    /* --- riwayat sendiri --- */
    if (["saya", "punyaku", "riwayat", "me"].includes(sub)) {
      const sender = num(m.sender);
      const milik = list.filter((x) => x.jid === sender);
      const lines = milik.length
        ? milik
            .slice(-10)
            .reverse()
            .map((x) => `◦ ${tanggalId(x.at)} — *${x.jenis}* ${labelStatus(x.status)}`)
        : ["◦ Kamu belum pernah mengajukan izin."];

      await m.reply(
        alyaHeader("Riwayat Izin", "📜") +
          "\n\n" +
          bracketBox("📜", "ᴘᴜɴʏᴀᴍᴜ", lines) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [`◦ Total pengajuan: *${milik.length}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Menampilkan 10 terakhir")
      );
      return { handled: true };
    }

    /* --- semua riwayat --- */
    if (["semua", "all", "history"].includes(sub)) {
      if (!list.length) {
        await m.reply(helpText(prefix, 0));
        return { handled: true };
      }
      const lines = list
        .slice(-20)
        .reverse()
        .map((x) => `◦ @${x.jid} *${x.jenis}* ${labelStatus(x.status)} (${tanggalId(x.at)})`);

      await m.reply(
        alyaHeader("Semua Izin", "📚") +
          "\n\n" +
          bracketBox("📚", "ʀɪᴡᴀʏᴀᴛ", lines) +
          "\n\n" +
          bracketBox("📊", "ʀɪɴɢᴋᴀꜱᴀɴ", [
            `◦ Total: *${list.length}*`,
            `◦ Menunggu: *${pending.length}*`,
            `◦ Disetujui: *${list.filter((x) => x.status === "setuju").length}*`,
            `◦ Ditolak: *${list.filter((x) => x.status === "tolak").length}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Menampilkan 20 terakhir"),
        { mentions: list.slice(-20).map((x) => `${x.jid}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- ajukan izin --- */
    if (!sub) {
      await m.reply(helpText(prefix, pending.length));
      return { handled: true };
    }

    const jenis = JENIS.includes(sub) ? sub : "lain";
    const alasan = (JENIS.includes(sub) ? args.slice(1) : args).join(" ").trim();

    if (!alasan) {
      await m.reply(
        alyaHeader("Alasan Kosong", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            `◦ Sertakan alasannya.`,
            `◦ Contoh: *${prefix}izin sakit demam tinggi*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Jenis: ${JENIS.join(" · ")}`)
      );
      return { handled: true };
    }

    const sender = num(m.sender);
    // Cegah pengajuan ganda di hari yang sama & masih menunggu.
    // Bandingkan sama-sama dalam zona WIB — memakai toISOString() akan
    // memberi tanggal UTC, yang berbeda hari antara pukul 00:00-06:59 WIB.
    const hari = todayKey();
    const sudahAda = pending.find(
      (x) => x.jid === sender && tanggalKunci(x.at) === hari
    );
    if (sudahAda) {
      await m.reply(
        alyaHeader("Sudah Mengajukan", "ℹ️") +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            `◦ Kamu sudah mengajukan izin *${sudahAda.jenis}* hari ini.`,
            "◦ Tunggu admin memprosesnya dulu.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}izin saya untuk cek status`)
      );
      return { handled: true };
    }

    list.push({
      jid: sender,
      nama: m.pushName || sender,
      jenis,
      alasan: alasan.slice(0, 150),
      status: "pending",
      at: Date.now(),
    });
    saveAll(db, m.chat, list);

    await m.reply(
      alyaHeader("Izin Diajukan", "📄") +
        "\n\n" +
        bracketBox("📄", "ᴅᴇᴛᴀɪʟ", [
          `◦ Member: @${sender}`,
          `◦ Jenis: *${jenis}*`,
          `◦ Alasan: *${alasan.slice(0, 80)}*`,
          "◦ Status: *⏳ menunggu admin*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Admin akan meninjau pengajuanmu"),
      { mentions: [`${sender}@s.whatsapp.net`] }
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}izin untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { getAll, saveAll, tanggalKunci, JENIS, KEY };
