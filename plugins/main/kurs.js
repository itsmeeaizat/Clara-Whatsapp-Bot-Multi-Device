/**
 * Kurs Mata Uang
 * ---------------------------------------------------------------
 * Sumber: frankfurter.dev (gratis, tanpa API key, data bank sentral Eropa).
 *
 *   .kurs                    kurs populer terhadap Rupiah
 *   .kurs usd                1 USD berapa Rupiah
 *   .kurs 100 usd            konversi 100 USD ke Rupiah
 *   .kurs 50 usd sgd         konversi antar mata uang
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const API = "https://api.frankfurter.dev/v1/latest";
const TIMEOUT = 15000;

/** Mata uang yang sering dipakai orang Indonesia. */
const POPULER = ["USD", "EUR", "SGD", "MYR", "JPY", "SAR", "AUD", "GBP"];

const BENDERA = {
  USD: "🇺🇸", EUR: "🇪🇺", SGD: "🇸🇬", MYR: "🇲🇾", JPY: "🇯🇵",
  SAR: "🇸🇦", AUD: "🇦🇺", GBP: "🇬🇧", IDR: "🇮🇩", CNY: "🇨🇳",
  KRW: "🇰🇷", THB: "🇹🇭", HKD: "🇭🇰", CHF: "🇨🇭", CAD: "🇨🇦",
  INR: "🇮🇳", PHP: "🇵🇭", NZD: "🇳🇿", TRY: "🇹🇷", AED: "🇦🇪",
};

const pluginConfig = {
  name: "kurs",
  alias: ["rate", "curs", "valas", "matauang", "currency", "nilaitukar"],
  category: "info",
  description: "Cek kurs mata uang dan konversi nominal",
  usage: ".kurs [jumlah] [dari] [ke]",
  example: ".kurs 100 usd",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 0,
  isEnabled: true,
};

/** Format angka gaya Indonesia, presisi menyesuaikan besaran. */
function fmt(n) {
  const v = Number(n) || 0;
  const desimal = Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 1 ? 2 : 4;
  return v.toLocaleString("id-ID", {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  });
}

function bendera(kode) {
  return BENDERA[kode] || "💱";
}

/** Parse "1.5jt", "100rb", "50000", "1,5" -> angka. */
function parseJumlah(input) {
  const raw = String(input || "").trim().toLowerCase().replace(/\s/g, "");
  if (!raw) return null;

  const adaSatuan = /(rb|ribu|k|jt|juta)$/.test(raw);
  const titik = (raw.match(/\./g) || []).length;
  let s = raw;

  if (adaSatuan && titik === 1 && /\.\d{1,2}(rb|ribu|k|jt|juta)$/.test(raw)) {
    s = raw.replace(".", ",");
  } else if (titik === 1 && /^\d+\.\d{1,2}$/.test(raw)) {
    // "12.5" -> desimal. Pemisah ribuan Indonesia selalu 3 digit
    // ("50.000"), jadi 1-2 digit di belakang titik pasti pecahan.
    s = raw.replace(".", ",");
  } else if (titik > 0) {
    if (!/^\d{1,3}(\.\d{3})+(rb|ribu|k|jt|juta)?$/.test(raw)) return null;
    s = raw.replace(/\./g, "");
  }

  const m = s.match(/^(\d+(?:,\d+)?)(rb|ribu|k|jt|juta)?$/);
  if (!m) return null;

  const angka = parseFloat(m[1].replace(",", "."));
  if (!Number.isFinite(angka) || angka <= 0) return null;

  const unit = m[2] || "";
  const mult =
    unit === "rb" || unit === "ribu" || unit === "k"
      ? 1000
      : unit === "jt" || unit === "juta"
        ? 1000000
        : 1;

  const hasil = angka * mult;
  return hasil > 0 && hasil <= 1e12 ? hasil : null;
}

async function ambilKurs(base, simbol) {
  const url = `${API}?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(simbol.join(","))}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ClaraBot/1.0)" },
  });
  if (res.status === 404) throw new Error("Kode mata uang tidak dikenal");
  if (!res.ok) throw new Error(`Server kurs error ${res.status}`);
  const data = await res.json();
  if (!data?.rates) throw new Error("Data kurs kosong");
  return data;
}

async function handler(m, { config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);

    /* --- tanpa argumen: kurs populer terhadap IDR --- */
    if (!args.length) {
      const data = await ambilKurs("IDR", POPULER);
      const lines = POPULER.filter((k) => data.rates[k]).map((k) => {
        const perSatu = 1 / data.rates[k]; // 1 <k> = berapa IDR
        return `◦ ${bendera(k)} *1 ${k}* = Rp${fmt(perSatu)}`;
      });

      await m.reply(
        alyaHeader("Kurs Rupiah", "💱") +
          "\n\n" +
          bracketBox("💰", "ᴋᴜʀꜱ ʜᴀʀɪ ɪɴɪ", lines) +
          "\n\n" +
          bracketBox("📅", "ɪɴꜰᴏ", [`◦ Data per: *${data.date}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}kurs 100 usd untuk konversi`),
      );
      return { handled: true };
    }

    /* --- parse argumen --- */
    let jumlah = 1;
    let dari;
    let ke = "IDR";

    const angkaPertama = parseJumlah(args[0]);
    if (angkaPertama !== null) {
      jumlah = angkaPertama;
      dari = (args[1] || "").toUpperCase();
      if (args[2]) ke = args[2].toUpperCase();
    } else {
      dari = (args[0] || "").toUpperCase();
      if (args[1]) ke = args[1].toUpperCase();
    }

    if (!/^[A-Z]{3}$/.test(dari)) {
      await m.reply(
        alyaHeader("Kode Salah", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            "◦ Kode mata uang harus 3 huruf.",
            `◦ Contoh: *${prefix}kurs 100 usd*`,
          ]) +
          "\n\n" +
          bracketBox("💱", "ᴘᴏᴘᴜʟᴇʀ", [`◦ ${POPULER.join(" · ")}`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}kurs untuk lihat kurs Rupiah`),
      );
      return { handled: true };
    }

    if (!/^[A-Z]{3}$/.test(ke)) ke = "IDR";

    if (dari === ke) {
      await m.reply(
        alyaHeader("Mata Uang Sama", "ℹ️") +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [`◦ ${fmt(jumlah)} ${dari} = ${fmt(jumlah)} ${ke}`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Pilih mata uang tujuan yang berbeda"),
      );
      return { handled: true };
    }

    const data = await ambilKurs(dari, [ke]);
    const rate = data.rates[ke];
    if (!rate) throw new Error(`Kurs ${dari} ke ${ke} tidak tersedia`);

    const hasil = jumlah * rate;

    await m.reply(
      alyaHeader("Konversi Kurs", "💱") +
        "\n\n" +
        bracketBox("🔄", "ʜᴀꜱɪʟ", [
          `◦ ${bendera(dari)} *${fmt(jumlah)} ${dari}*`,
          `◦ 　　⬇️`,
          `◦ ${bendera(ke)} *${fmt(hasil)} ${ke}*`,
        ]) +
        "\n\n" +
        bracketBox("📊", "ᴅᴇᴛᴀɪʟ", [
          // Kurs kecil (mis. 1 IDR = 0,0001 USD) tidak informatif,
          // jadi tampilkan arah balikannya yang lebih mudah dibaca.
          rate < 0.01
            ? `◦ Kurs: *1 ${ke} = ${fmt(1 / rate)} ${dari}*`
            : `◦ Kurs: *1 ${dari} = ${fmt(rate)} ${ke}*`,
          `◦ Data per: *${data.date}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Sumber: frankfurter.dev · kurs referensi"),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}kurs untuk kurs Rupiah`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { parseJumlah, fmt, POPULER, bendera };
