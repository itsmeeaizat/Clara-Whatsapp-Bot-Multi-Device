/**
 * Kas Grup
 * ---------------------------------------------------------------
 * Pencatatan kas/iuran grup: siapa sudah bayar, sisa saldo, dan
 * riwayat pemasukan/pengeluaran. Cocok untuk grup arisan, kelas,
 * RT, atau komunitas.
 *
 * Semua nominal disimpan sebagai integer rupiah.
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

const KEY = "kasGrup";
const MAX_RIWAYAT = 100;

/* ------------------------------------------------------------------ */
/* Format rupiah                                                       */
/* ------------------------------------------------------------------ */

function rupiah(n) {
  const v = Math.round(Number(n) || 0);
  return "Rp" + v.toLocaleString("id-ID");
}

/**
 * Parse nominal: "50000", "50rb", "50k", "1.5jt", "2juta"
 * @returns {number|null}
 */
function parseNominal(input) {
  let raw = String(input || "").trim().toLowerCase().replace(/\s/g, "");
  if (!raw) return null;

  // Titik itu ambigu di Indonesia: bisa pemisah ribuan ("50.000") atau
  // desimal ("1.5jt"). Bedakan dari konteks — kalau ada satuan (jt/rb/k)
  // dan hanya satu titik dengan 1-2 digit di belakangnya, itu desimal.
  // Kalau tidak, perlakukan titik sebagai pemisah ribuan.
  const adaSatuan = /(rb|ribu|k|jt|juta|m)$/.test(raw);
  const titik = (raw.match(/\./g) || []).length;
  const desimal = adaSatuan && titik === 1 && /\.\d{1,2}(rb|ribu|k|jt|juta|m)$/.test(raw);

  if (desimal) {
    raw = raw.replace(".", ",");
  } else if (titik > 0) {
    // Sebagai pemisah ribuan, pola harus rapi: 1.000 / 50.000 / 1.000.000
    if (!/^\d{1,3}(\.\d{3})+(rb|ribu|k|jt|juta|m)?$/.test(raw)) return null;
    raw = raw.replace(/\./g, "");
  }

  const m = raw.match(/^(\d+(?:,\d+)?)(rb|ribu|k|jt|juta|m)?$/);
  if (!m) return null;

  const angka = parseFloat(m[1].replace(",", "."));
  if (!Number.isFinite(angka) || angka <= 0) return null;

  const unit = m[2] || "";
  const mult =
    unit === "rb" || unit === "ribu" || unit === "k"
      ? 1000
      : unit === "jt" || unit === "juta" || unit === "m"
        ? 1000000
        : 1;

  const hasil = Math.round(angka * mult);
  return hasil > 0 && hasil <= 1_000_000_000 ? hasil : null;
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function defaultKas() {
  return { iuran: 0, saldo: 0, bayar: {}, riwayat: [] };
}

function getKas(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  if (!raw || typeof raw !== "object") return defaultKas();
  return {
    iuran: Number(raw.iuran) || 0,
    saldo: Number(raw.saldo) || 0,
    bayar: raw.bayar && typeof raw.bayar === "object" ? raw.bayar : {},
    riwayat: Array.isArray(raw.riwayat) ? raw.riwayat : [],
  };
}

function saveKas(db, groupId, kas) {
  kas.riwayat = kas.riwayat.slice(-MAX_RIWAYAT);
  writeGroupState(db, KEY, groupId, kas);
}

function catat(kas, tipe, nominal, ket, oleh) {
  kas.riwayat.push({
    tipe,
    nominal,
    ket: String(ket || "").slice(0, 80),
    oleh: num(oleh),
    at: Date.now(),
  });
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "kas",
  alias: ["kas", "iuran", "kasgrup", "uangkas", "duitkas"],
  category: "group",
  description: "Catat kas & iuran grup: siapa sudah bayar dan sisa saldo",
  usage: ".kas <set|bayar|keluar|cek|belum|riwayat|reset>",
  example: ".kas bayar @628xxx 50rb",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix, kas) {
  return (
    alyaHeader("Kas Grup", "💰") +
    "\n\n" +
    bracketBox("💰", "ʀɪɴɢᴋᴀꜱᴀɴ", [
      `◦ Saldo: *${rupiah(kas.saldo)}*`,
      `◦ Iuran per orang: *${kas.iuran ? rupiah(kas.iuran) : "belum diset"}*`,
      `◦ Sudah bayar: *${Object.keys(kas.bayar).length} orang*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}kas set 50rb* — set iuran`,
      `◦ *${prefix}kas bayar @user 50rb*`,
      `◦ *${prefix}kas keluar 30rb <ket>*`,
      `◦ *${prefix}kas cek* — daftar pembayar`,
      `◦ *${prefix}kas belum* — yang belum bayar`,
      `◦ *${prefix}kas riwayat* — transaksi`,
      `◦ *${prefix}kas reset* — mulai periode baru`,
    ]) +
    "\n\n" +
    bracketBox("💡", "ꜰᴏʀᴍᴀᴛ ɴᴏᴍɪɴᴀʟ", ["◦ 50000 · 50rb · 50k · 1.5jt"]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Pencatatan uang khusus admin grup")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa mengubah kas."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}kas cek untuk melihat saja`)
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const kas = getKas(db, m.chat);

    /* --- set iuran --- */
    if (sub === "set" || sub === "iuran") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const n = parseNominal(args[1]);
      if (!n) {
        await m.reply(
          alyaHeader("Nominal Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Contoh: *${prefix}kas set 50rb*`,
              "◦ Format: 50000 · 50rb · 50k · 1.5jt",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Masukkan nominal yang valid")
        );
        return { handled: true };
      }
      kas.iuran = n;
      saveKas(db, m.chat, kas);
      await m.reply(
        alyaHeader("Iuran Diset", "💰") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Iuran per orang: *${rupiah(n)}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}kas bayar @user untuk mencatat`)
      );
      return { handled: true };
    }

    /* --- bayar --- */
    if (sub === "bayar" || sub === "masuk" || sub === "setor") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };

      const target = num(m.mentionedJid?.[0]) || num(m.sender);
      const nominalArg = args.find((a, i) => i > 0 && !a.startsWith("@") && parseNominal(a));
      const n = parseNominal(nominalArg) || kas.iuran;

      if (!n) {
        await m.reply(
          alyaHeader("Nominal Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Set iuran dulu: *${prefix}kas set 50rb*`,
              `◦ Atau sebut nominal: *${prefix}kas bayar @user 50rb*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Butuh nominal untuk mencatat")
        );
        return { handled: true };
      }

      kas.bayar[target] = (kas.bayar[target] || 0) + n;
      kas.saldo += n;
      catat(kas, "masuk", n, `bayar kas @${target}`, m.sender);
      saveKas(db, m.chat, kas);

      await m.reply(
        alyaHeader("Pembayaran Dicatat", "✅") +
          "\n\n" +
          bracketBox("💵", "ᴅᴇᴛᴀɪʟ", [
            `◦ Member: @${target}`,
            `◦ Bayar: *${rupiah(n)}*`,
            `◦ Total dia: *${rupiah(kas.bayar[target])}*`,
          ]) +
          "\n\n" +
          bracketBox("💰", "ᴋᴀꜱ", [
            `◦ Saldo sekarang: *${rupiah(kas.saldo)}*`,
            `◦ Sudah bayar: *${Object.keys(kas.bayar).length} orang*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Terima kasih sudah membayar"),
        { mentions: [`${target}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- pengeluaran --- */
    if (sub === "keluar" || sub === "pakai" || sub === "belanja") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const n = parseNominal(args[1]);
      const ket = args.slice(2).join(" ").trim();

      if (!n) {
        await m.reply(
          alyaHeader("Nominal Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}kas keluar 30rb beli spanduk*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Sertakan nominal dan keterangan")
        );
        return { handled: true };
      }
      if (n > kas.saldo) {
        await m.reply(
          alyaHeader("Saldo Kurang", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Saldo: *${rupiah(kas.saldo)}*`,
              `◦ Diminta: *${rupiah(n)}*`,
              `◦ Kurang: *${rupiah(n - kas.saldo)}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Tidak bisa mengeluarkan melebihi saldo")
        );
        return { handled: true };
      }

      kas.saldo -= n;
      catat(kas, "keluar", n, ket || "pengeluaran", m.sender);
      saveKas(db, m.chat, kas);

      await m.reply(
        alyaHeader("Pengeluaran Dicatat", "📤") +
          "\n\n" +
          bracketBox("📤", "ᴅᴇᴛᴀɪʟ", [
            `◦ Nominal: *${rupiah(n)}*`,
            `◦ Keterangan: *${ket || "-"}*`,
            `◦ Dicatat oleh: @${num(m.sender)}`,
          ]) +
          "\n\n" +
          bracketBox("💰", "ᴋᴀꜱ", [`◦ Sisa saldo: *${rupiah(kas.saldo)}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Simpan bukti pengeluaran ya"),
        { mentions: [`${num(m.sender)}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- cek --- */
    if (!sub || ["cek", "lihat", "status", "saldo"].includes(sub)) {
      const entries = Object.entries(kas.bayar);
      if (!entries.length && !kas.saldo) {
        await m.reply(helpText(prefix, kas));
        return { handled: true };
      }
      const lines = entries.length
        ? entries
            .sort((a, b) => b[1] - a[1])
            .slice(0, 25)
            .map(([j, v], i) => `◦ ${i + 1}. @${j} — ${rupiah(v)}`)
        : ["◦ Belum ada yang membayar."];

      const masuk = kas.riwayat.filter((r) => r.tipe === "masuk").reduce((a, b) => a + b.nominal, 0);
      const keluar = kas.riwayat.filter((r) => r.tipe === "keluar").reduce((a, b) => a + b.nominal, 0);

      await m.reply(
        alyaHeader("Kas Grup", "💰") +
          "\n\n" +
          bracketBox("💵", "ꜱᴜᴅᴀʜ ʙᴀʏᴀʀ", lines) +
          "\n\n" +
          bracketBox("📊", "ʀɪɴɢᴋᴀꜱᴀɴ", [
            `◦ Saldo: *${rupiah(kas.saldo)}*`,
            `◦ Total masuk: *${rupiah(masuk)}*`,
            `◦ Total keluar: *${rupiah(keluar)}*`,
            `◦ Iuran: *${kas.iuran ? rupiah(kas.iuran) : "belum diset"}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}kas belum untuk lihat yang nunggak`),
        { mentions: entries.slice(0, 25).map(([j]) => `${j}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- belum bayar --- */
    if (["belum", "nunggak", "utang"].includes(sub)) {
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

      const target = kas.iuran || 0;
      const belum = all.filter((j) => (kas.bayar[j] || 0) < target);
      const lines = belum.length
        ? belum.slice(0, 30).map((j, i) => {
            const sudah = kas.bayar[j] || 0;
            const kurang = target - sudah;
            return `◦ ${i + 1}. @${j} — kurang ${rupiah(kurang)}`;
          })
        : ["◦ Semua sudah lunas 🎉"];

      await m.reply(
        alyaHeader("Belum Lunas", "⏳") +
          "\n\n" +
          bracketBox("⏳", "ᴅᴀꜰᴛᴀʀ", lines) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [
            `◦ Iuran: *${target ? rupiah(target) : "belum diset"}*`,
            `◦ Belum lunas: *${belum.length}* dari *${all.length}*`,
            `◦ Potensi masuk: *${rupiah(belum.reduce((a, j) => a + (target - (kas.bayar[j] || 0)), 0))}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(target ? "Yuk dilunasi" : `Set iuran dulu: ${prefix}kas set`),
        { mentions: belum.slice(0, 30).map((j) => `${j}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- riwayat --- */
    if (["riwayat", "history", "log", "mutasi"].includes(sub)) {
      const lines = kas.riwayat.length
        ? kas.riwayat
            .slice(-15)
            .reverse()
            .map((r) => {
              const tgl = new Date(r.at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                timeZone: "Asia/Jakarta",
              });
              const tanda = r.tipe === "masuk" ? "🟢" : "🔴";
              return `◦ ${tanda} ${tgl} ${rupiah(r.nominal)}\n│     ${r.ket}`;
            })
        : ["◦ Belum ada transaksi."];

      await m.reply(
        alyaHeader("Riwayat Kas", "📜") +
          "\n\n" +
          bracketBox("📜", "ᴛʀᴀɴꜱᴀᴋꜱɪ", lines) +
          "\n\n" +
          bracketBox("💰", "ꜱᴀʟᴅᴏ", [`◦ *${rupiah(kas.saldo)}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Menampilkan 15 transaksi terakhir")
      );
      return { handled: true };
    }

    /* --- reset --- */
    if (["reset", "periodebaru", "clear"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const saldoLama = kas.saldo;
      const iuranLama = kas.iuran;
      saveKas(db, m.chat, {
        iuran: iuranLama,
        saldo: saldoLama,
        bayar: {},
        riwayat: [
          ...kas.riwayat.slice(-20),
          { tipe: "reset", nominal: 0, ket: "periode baru", oleh: num(m.sender), at: Date.now() },
        ],
      });

      await m.reply(
        alyaHeader("Periode Baru", "🔄") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            "◦ Daftar pembayar dikosongkan.",
            `◦ Saldo tetap: *${rupiah(saldoLama)}*`,
            `◦ Iuran tetap: *${iuranLama ? rupiah(iuranLama) : "belum diset"}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Siap untuk periode iuran berikutnya")
      );
      return { handled: true };
    }

    await m.reply(helpText(prefix, kas));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}kas untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { parseNominal, rupiah, getKas, saveKas, KEY };
