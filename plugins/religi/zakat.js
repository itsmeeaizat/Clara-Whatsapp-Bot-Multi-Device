// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Kalkulator Zakat
 * ---------------------------------------------------------------
 * Menghitung zakat sesuai ketentuan umum di Indonesia (rujukan BAZNAS):
 *
 *   .zakat penghasilan 8jt        2,5% bila mencapai nisab
 *   .zakat maal 100jt             2,5% harta tersimpan setahun
 *   .zakat fitrah 4                beras 2,5 kg atau uang setara
 *   .zakat perdagangan 50jt
 *   .zakat nisab                   info batas nisab terkini
 *
 * Catatan: nisab emas berubah mengikuti harga pasar. Nilai default di
 * sini bisa diperbarui owner lewat `.zakat setemas <harga per gram>`.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const KEY = "zakatConfig";

/** Ketentuan dasar. */
const NISAB_EMAS_GRAM = 85; // nisab maal & penghasilan tahunan
const HARGA_EMAS_DEFAULT = 1_800_000; // per gram, dapat disesuaikan
const KADAR_ZAKAT = 0.025; // 2,5%
const FITRAH_KG = 2.5; // beras per jiwa
const HARGA_BERAS_DEFAULT = 15_000; // per kg

function rupiah(n) {
  return "Rp" + Math.round(Number(n) || 0).toLocaleString("id-ID");
}

/** Parse "8jt", "100rb", "8.500.000", "8500000". */
function parseNominal(input) {
  let raw = String(input || "").trim().toLowerCase().replace(/\s/g, "");
  if (!raw) return null;

  const adaSatuan = /(rb|ribu|k|jt|juta|m)$/.test(raw);
  const titik = (raw.match(/\./g) || []).length;
  const desimal = adaSatuan && titik === 1 && /\.\d{1,2}(rb|ribu|k|jt|juta|m)$/.test(raw);

  if (desimal) {
    raw = raw.replace(".", ",");
  } else if (titik > 0) {
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
  return hasil > 0 && hasil <= 1e15 ? hasil : null;
}

function getCfg(db) {
  try {
    const raw = db?.setting?.(KEY);
    return {
      hargaEmas: Number(raw?.hargaEmas) || HARGA_EMAS_DEFAULT,
      hargaBeras: Number(raw?.hargaBeras) || HARGA_BERAS_DEFAULT,
    };
  } catch {
    return { hargaEmas: HARGA_EMAS_DEFAULT, hargaBeras: HARGA_BERAS_DEFAULT };
  }
}

function saveCfg(db, cfg) {
  try {
    db?.setting?.(KEY, cfg);
    return true;
  } catch {
    return false;
  }
}

const pluginConfig = {
  name: "zakat",
  alias: ["hitungzakat", "kalkulatorzakat", "zakatmal"],
  category: "religi",
  description: "Hitung zakat penghasilan, maal, fitrah, dan perdagangan",
  usage: ".zakat <jenis> <nominal>",
  example: ".zakat penghasilan 8jt",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix, cfg) {
  const nisabTahun = NISAB_EMAS_GRAM * cfg.hargaEmas;
  return (
    alyaHeader("Kalkulator Zakat", "🕌") +
    "\n\n" +
    bracketBox("📋", "ᴊᴇɴɪꜱ ᴢᴀᴋᴀᴛ", [
      `◦ *${prefix}zakat penghasilan 8jt*`,
      `◦ *${prefix}zakat maal 100jt*`,
      `◦ *${prefix}zakat perdagangan 50jt*`,
      `◦ *${prefix}zakat fitrah 4* (jumlah jiwa)`,
    ]) +
    "\n\n" +
    bracketBox("📊", "ᴋᴇᴛᴇɴᴛᴜᴀɴ", [
      `◦ Kadar zakat: *2,5%*`,
      `◦ Nisab: *${NISAB_EMAS_GRAM} gram emas*`,
      `◦ Harga emas: *${rupiah(cfg.hargaEmas)}/gram*`,
      `◦ Nisab setahun: *${rupiah(nisabTahun)}*`,
      `◦ Fitrah: *${FITRAH_KG} kg beras/jiwa*`,
    ]) +
    "\n\n" +
    bracketBox("⚙️", "ʟᴀɪɴɴʏᴀ", [
      `◦ *${prefix}zakat nisab* — detail nisab`,
      `◦ *${prefix}zakat setemas 1.8jt* (owner)`,
      `◦ *${prefix}zakat setberas 15rb* (owner)`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Perhitungan mengikuti rujukan umum BAZNAS")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const cfg = getCfg(db);
    const nisabTahun = NISAB_EMAS_GRAM * cfg.hargaEmas;
    const nisabBulan = nisabTahun / 12;

    if (!sub || ["help", "bantuan"].includes(sub)) {
      await m.reply(helpText(prefix, cfg));
      return { handled: true };
    }

    /* --- info nisab --- */
    if (["nisab", "batas", "info"].includes(sub)) {
      await m.reply(
        alyaHeader("Nisab Zakat", "📊") +
          "\n\n" +
          bracketBox("🪙", "ᴀᴄᴜᴀɴ ᴇᴍᴀꜱ", [
            `◦ Nisab: *${NISAB_EMAS_GRAM} gram emas*`,
            `◦ Harga emas: *${rupiah(cfg.hargaEmas)}/gram*`,
          ]) +
          "\n\n" +
          bracketBox("💰", "ʙᴀᴛᴀꜱ ᴡᴀᴊɪʙ", [
            `◦ Per tahun: *${rupiah(nisabTahun)}*`,
            `◦ Per bulan: *${rupiah(nisabBulan)}*`,
            `◦ Kadar: *2,5%*`,
          ]) +
          "\n\n" +
          bracketBox("ℹ️", "ᴄᴀᴛᴀᴛᴀɴ", [
            "◦ Harta wajib mengendap 1 tahun (haul)",
            "◦ Kecuali zakat penghasilan & pertanian",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Harga emas berubah — sesuaikan bila perlu"),
      );
      return { handled: true };
    }

    /* --- owner: atur harga acuan --- */
    if (["setemas", "setberas"].includes(sub)) {
      if (!m.isOwner) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya owner yang bisa mengubah harga acuan."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Ketik ${prefix}zakat untuk menghitung`),
        );
        return { handled: true };
      }
      const nilai = parseNominal(args[1]);
      if (!nilai) {
        await m.reply(
          alyaHeader("Nominal Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}zakat ${sub} 1.8jt*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Format: 1800000 · 1.8jt · 15rb"),
        );
        return { handled: true };
      }

      if (sub === "setemas") cfg.hargaEmas = nilai;
      else cfg.hargaBeras = nilai;
      saveCfg(db, cfg);

      await m.reply(
        alyaHeader("Harga Diperbarui", "⚙️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            sub === "setemas"
              ? `◦ Harga emas: *${rupiah(cfg.hargaEmas)}/gram*`
              : `◦ Harga beras: *${rupiah(cfg.hargaBeras)}/kg*`,
            `◦ Nisab baru: *${rupiah(NISAB_EMAS_GRAM * cfg.hargaEmas)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}zakat nisab untuk detail`),
      );
      return { handled: true };
    }

    /* --- zakat fitrah --- */
    if (["fitrah", "fitri"].includes(sub)) {
      const jiwa = parseInt(args[1], 10) || 1;
      if (jiwa < 1 || jiwa > 100) {
        await m.reply(
          alyaHeader("Jumlah Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Jumlah jiwa 1-100. Contoh: *${prefix}zakat fitrah 4*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Hitung sesuai anggota keluarga"),
        );
        return { handled: true };
      }

      const totalKg = jiwa * FITRAH_KG;
      const totalUang = totalKg * cfg.hargaBeras;

      await m.reply(
        alyaHeader("Zakat Fitrah", "🍚") +
          "\n\n" +
          bracketBox("👨‍👩‍👧‍👦", "ᴊᴜᴍʟᴀʜ", [
            `◦ Jiwa: *${jiwa} orang*`,
            `◦ Per jiwa: *${FITRAH_KG} kg beras*`,
          ]) +
          "\n\n" +
          bracketBox("💰", "ʏᴀɴɢ ᴅɪʙᴀʏᴀʀ", [
            `◦ Bentuk beras: *${totalKg} kg*`,
            `◦ Bentuk uang: *${rupiah(totalUang)}*`,
            `◦ (asumsi beras ${rupiah(cfg.hargaBeras)}/kg)`,
          ]) +
          "\n\n" +
          bracketBox("ℹ️", "ᴄᴀᴛᴀᴛᴀɴ", [
            "◦ Dibayar sebelum salat Idulfitri",
            "◦ Gunakan kualitas beras yang biasa dimakan",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Semoga diterima dan berkah"),
      );
      return { handled: true };
    }

    /* --- penghasilan / maal / perdagangan --- */
    const jenisValid = {
      penghasilan: { label: "Zakat Penghasilan", emoji: "💼", bulanan: true },
      profesi: { label: "Zakat Penghasilan", emoji: "💼", bulanan: true },
      maal: { label: "Zakat Maal", emoji: "💰", bulanan: false },
      mal: { label: "Zakat Maal", emoji: "💰", bulanan: false },
      harta: { label: "Zakat Maal", emoji: "💰", bulanan: false },
      perdagangan: { label: "Zakat Perdagangan", emoji: "🏪", bulanan: false },
      dagang: { label: "Zakat Perdagangan", emoji: "🏪", bulanan: false },
      tabungan: { label: "Zakat Tabungan", emoji: "🏦", bulanan: false },
    };

    const jenis = jenisValid[sub];
    if (!jenis) {
      await m.reply(helpText(prefix, cfg));
      return { handled: true };
    }

    const nominal = parseNominal(args[1]);
    if (!nominal) {
      await m.reply(
        alyaHeader("Nominal Kosong", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            `◦ Contoh: *${prefix}zakat ${sub} 8jt*`,
            "◦ Format: 8000000 · 8jt · 8.000.000",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Masukkan nominal yang valid"),
      );
      return { handled: true };
    }

    const nisab = jenis.bulanan ? nisabBulan : nisabTahun;
    const wajib = nominal >= nisab;
    const zakat = nominal * KADAR_ZAKAT;

    const lines = [
      `◦ Jumlah: *${rupiah(nominal)}*`,
      `◦ Nisab${jenis.bulanan ? " /bulan" : " /tahun"}: *${rupiah(nisab)}*`,
      `◦ Status: *${wajib ? "✅ Wajib zakat" : "❌ Belum mencapai nisab"}*`,
    ];

    const hasil = wajib
      ? [
          `◦ Kadar: *2,5%*`,
          `◦ Zakat: *${rupiah(zakat)}*`,
          ...(jenis.bulanan ? [`◦ Setahun: *${rupiah(zakat * 12)}*`] : []),
        ]
      : [
          `◦ Kurang: *${rupiah(nisab - nominal)}*`,
          "◦ Belum wajib, namun sedekah tetap dianjurkan",
        ];

    await m.reply(
      alyaHeader(jenis.label, jenis.emoji) +
        "\n\n" +
        bracketBox("📊", "ᴘᴇʀʜɪᴛᴜɴɢᴀɴ", lines) +
        "\n\n" +
        bracketBox(wajib ? "💵" : "ℹ️", wajib ? "ᴢᴀᴋᴀᴛ" : "ᴄᴀᴛᴀᴛᴀɴ", hasil) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(
          jenis.bulanan
            ? "Nisab bulanan = nisab tahunan ÷ 12"
            : "Harta wajib mengendap 1 tahun (haul)",
        ),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}zakat untuk bantuan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export {
  parseNominal,
  rupiah,
  getCfg,
  saveCfg,
  NISAB_EMAS_GRAM,
  KADAR_ZAKAT,
  FITRAH_KG,
  KEY,
};
