// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Voting / Polling Grup
 * ---------------------------------------------------------------
 * Voting sederhana dengan pilihan bernomor. Member memilih dengan
 * mengetik ".pilih 2" atau cukup angka bila sesi sedang berjalan.
 * Hasil ditampilkan dengan bar visual.
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
  parseDuration,
  humanDuration,
} from "../../src/lib/clara-group-util.js";

const KEY = "votingSesi";
const MAX_OPSI = 10;

/* ------------------------------------------------------------------ */
/* Perhitungan                                                         */
/* ------------------------------------------------------------------ */

/** Hitung suara per opsi. votes = { jid: index } */
function tally(sesi) {
  const counts = new Array(sesi.opsi.length).fill(0);
  for (const idx of Object.values(sesi.votes || {})) {
    if (Number.isInteger(idx) && idx >= 0 && idx < counts.length) counts[idx]++;
  }
  return counts;
}

/** Bar visual proporsional, lebar maksimum 10 blok. */
function bar(count, total, width = 10) {
  if (!total) return "░".repeat(width);
  const filled = Math.round((count / total) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function hasilLines(sesi) {
  const counts = tally(sesi);
  const total = counts.reduce((a, b) => a + b, 0);
  return sesi.opsi.map((o, i) => {
    const c = counts[i];
    const pct = total ? Math.round((c / total) * 100) : 0;
    return `◦ ${i + 1}. ${o}\n│     ${bar(c, total)} ${c} (${pct}%)`;
  });
}

function pemenang(sesi) {
  const counts = tally(sesi);
  const max = Math.max(...counts, 0);
  if (max === 0) return { text: "Belum ada suara", seri: false };
  const idxs = counts.map((c, i) => (c === max ? i : -1)).filter((i) => i >= 0);
  if (idxs.length > 1) {
    return { text: idxs.map((i) => sesi.opsi[i]).join(" & "), seri: true, max };
  }
  return { text: sesi.opsi[idxs[0]], seri: false, max };
}

/* ------------------------------------------------------------------ */
/* Listener angka polos                                                */
/* ------------------------------------------------------------------ */

/**
 * Bila sesi voting aktif dan user mengetik angka saja, hitung sebagai suara.
 * @returns {Promise<false|{opsi:string,ganti:boolean}>}
 */
async function tryVote(m, db) {
  try {
    if (!m?.isGroup) return false;
    const sesi = readGroupState(db, KEY, m.chat);
    if (!sesi || sesi.closed) return false;
    if (sesi.endAt && sesi.endAt <= Date.now()) return false;

    const raw = String(m.text || "").trim();
    if (!/^\d{1,2}$/.test(raw)) return false;

    const idx = parseInt(raw, 10) - 1;
    if (idx < 0 || idx >= sesi.opsi.length) return false;

    const sender = num(m.sender);
    sesi.votes = sesi.votes || {};
    const sebelum = sesi.votes[sender];
    if (sebelum === idx) return false;

    sesi.votes[sender] = idx;
    writeGroupState(db, KEY, m.chat, sesi);
    return { opsi: sesi.opsi[idx], ganti: sebelum !== undefined };
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "voting",
  alias: ["voting", "vote", "polling", "poll", "undianpendapat"],
  category: "group",
  description: "Voting grup dengan pilihan bernomor & hasil bar visual",
  usage: ".voting buat <pertanyaan> | opsi1 | opsi2",
  example: ".voting buat Makan dimana? | Padang | Sunda | Bakso",
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
    alyaHeader("Voting Grup", "🗳️") +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}voting buat <tanya> | a | b*`,
      `◦ *${prefix}voting hasil* — lihat perolehan`,
      `◦ *${prefix}voting tutup* — akhiri & umumkan`,
      `◦ *${prefix}voting batal* — batalkan`,
    ]) +
    "\n\n" +
    bracketBox("✋", "ᴄᴀʀᴀ ᴍᴇᴍɪʟɪʜ", [
      "◦ Ketik angka pilihan saja, contoh: *2*",
      "◦ Bisa ganti pilihan kapan saja",
    ]) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}voting buat Makan dimana? | Padang | Sunda`,
      `◦ ${prefix}voting buat 30m Libur? | Ya | Tidak`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Durasi opsional di awal: 30m / 2h / 1d")
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
    tipText(`Ketik ${prefix}voting untuk bantuan`)
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const raw = (m.text || "").trim();
    const args = raw.split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const sesi = readGroupState(db, KEY, m.chat);
    const aktif = sesi && !sesi.closed && (!sesi.endAt || sesi.endAt > Date.now());

    /* --- buat --- */
    if (["buat", "mulai", "start", "new", "bikin"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(tolakAdmin(prefix));
        return { handled: true };
      }
      if (aktif) {
        await m.reply(
          alyaHeader("Voting Berjalan", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Pertanyaan: *${sesi.tanya}*`,
              `◦ Suara masuk: *${Object.keys(sesi.votes || {}).length}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}voting tutup untuk mengakhiri`)
        );
        return { handled: true };
      }

      let body = raw.slice(sub.length).trim();

      // Durasi opsional di awal
      let durasiMs = null;
      const firstWord = body.split(/\s+/)[0];
      const maybe = parseDuration(firstWord, 7 * 86400_000);
      if (maybe) {
        durasiMs = maybe;
        body = body.slice(firstWord.length).trim();
      }

      const parts = body.split("|").map((x) => x.trim()).filter(Boolean);
      const tanya = parts[0];
      const opsi = parts.slice(1);

      if (!tanya || opsi.length < 2) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      if (opsi.length > MAX_OPSI) {
        await m.reply(
          alyaHeader("Terlalu Banyak", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ʙᴀᴛᴀꜱ", [`◦ Maksimal *${MAX_OPSI}* pilihan.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Kurangi jumlah opsi")
        );
        return { handled: true };
      }

      const newSesi = {
        tanya,
        opsi,
        votes: {},
        by: num(m.sender),
        startedAt: Date.now(),
        endAt: durasiMs ? Date.now() + durasiMs : null,
        closed: false,
      };
      writeGroupState(db, KEY, m.chat, newSesi);

      await m.reply(
        alyaHeader("Voting Dibuka", "🗳️") +
          "\n\n" +
          bracketBox("❓", "ᴘᴇʀᴛᴀɴʏᴀᴀɴ", [`◦ ${tanya}`]) +
          "\n\n" +
          bracketBox("🔢", "ᴘɪʟɪʜᴀɴ", opsi.map((o, i) => `◦ ${i + 1}. ${o}`)) +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            "◦ Ketik *angka* untuk memilih",
            durasiMs ? `◦ Berakhir dalam: *${humanDuration(durasiMs)}*` : "◦ Tanpa batas waktu",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Dibuka oleh @${num(m.sender)}`),
        { mentions: [`${num(m.sender)}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- hasil --- */
    if (["hasil", "cek", "lihat", "status", "result"].includes(sub)) {
      if (!sesi) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      const total = Object.keys(sesi.votes || {}).length;
      const w = pemenang(sesi);

      await m.reply(
        alyaHeader("Hasil Voting", "📊") +
          "\n\n" +
          bracketBox("❓", "ᴘᴇʀᴛᴀɴʏᴀᴀɴ", [`◦ ${sesi.tanya}`]) +
          "\n\n" +
          bracketBox("📊", "ᴘᴇʀᴏʟᴇʜᴀɴ", hasilLines(sesi)) +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            `◦ Total suara: *${total}*`,
            `◦ Sementara unggul: *${w.text}*`,
            sesi.endAt
              ? `◦ Sisa waktu: *${sesi.endAt > Date.now() ? humanDuration(sesi.endAt - Date.now()) : "habis"}*`
              : "◦ Tanpa batas waktu",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Ketik angka untuk ikut memilih")
      );
      return { handled: true };
    }

    /* --- tutup --- */
    if (["tutup", "selesai", "close", "akhiri"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(tolakAdmin(prefix));
        return { handled: true };
      }
      if (!sesi) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }

      const total = Object.keys(sesi.votes || {}).length;
      const w = pemenang(sesi);
      writeGroupState(db, KEY, m.chat, null);

      await m.reply(
        alyaHeader("Voting Selesai", "🏁") +
          "\n\n" +
          bracketBox("❓", "ᴘᴇʀᴛᴀɴʏᴀᴀɴ", [`◦ ${sesi.tanya}`]) +
          "\n\n" +
          bracketBox("📊", "ʜᴀꜱɪʟ ᴀᴋʜɪʀ", hasilLines(sesi)) +
          "\n\n" +
          bracketBox("🏆", "ᴘᴇᴍᴇɴᴀɴɢ", [
            total === 0
              ? "◦ Tidak ada suara masuk"
              : w.seri
                ? `◦ Seri: *${w.text}*`
                : `◦ *${w.text}* dengan *${w.max}* suara`,
            `◦ Total pemilih: *${total}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Voting ditutup")
      );
      return { handled: true };
    }

    /* --- batal --- */
    if (["batal", "cancel", "hapus"].includes(sub)) {
      if (!isAdmin(m)) {
        await m.reply(tolakAdmin(prefix));
        return { handled: true };
      }
      if (!sesi) {
        await m.reply(helpText(prefix));
        return { handled: true };
      }
      writeGroupState(db, KEY, m.chat, null);
      await m.reply(
        alyaHeader("Dibatalkan", "🚫") +
          "\n\n" +
          bracketBox("🚫", "ɪɴꜰᴏ", [`◦ Voting *${sesi.tanya}* dibatalkan.`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}voting buat untuk membuat baru`)
      );
      return { handled: true };
    }

    if (aktif) {
      const total = Object.keys(sesi.votes || {}).length;
      await m.reply(
        alyaHeader("Voting Aktif", "🗳️") +
          "\n\n" +
          bracketBox("❓", "ᴘᴇʀᴛᴀɴʏᴀᴀɴ", [`◦ ${sesi.tanya}`]) +
          "\n\n" +
          bracketBox("🔢", "ᴘɪʟɪʜᴀɴ", sesi.opsi.map((o, i) => `◦ ${i + 1}. ${o}`)) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [`◦ Suara masuk: *${total}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Ketik angka untuk memilih")
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
        tipText(`Ketik ${prefix}voting untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { tryVote, tally, bar, pemenang, KEY };
