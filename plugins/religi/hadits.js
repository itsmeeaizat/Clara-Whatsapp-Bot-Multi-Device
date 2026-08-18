/**
 * Hadits
 * ---------------------------------------------------------------
 * Menampilkan hadits Arbain Nawawi dan hadits dari sembilan kitab
 * perawi utama, lengkap dengan teks Arab dan terjemahan Indonesia.
 *
 *   .hadits              hadits acak
 *   .hadits arbain 1
 *   .hadits bukhari 100
 *   .hadits perawi       daftar kitab
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const BASE = "https://api.myquran.com/v2/hadits";
const WAKTU_HABIS = 15_000;

/** Sembilan kitab perawi yang tersedia beserta jumlah haditsnya. */
const PERAWI = {
  "abu-dawud": { nama: "Abu Dawud", total: 4419 },
  ahmad: { nama: "Ahmad", total: 4305 },
  bukhari: { nama: "Bukhari", total: 6638 },
  darimi: { nama: "Darimi", total: 2949 },
  "ibnu-majah": { nama: "Ibnu Majah", total: 4285 },
  malik: { nama: "Malik", total: 1587 },
  muslim: { nama: "Muslim", total: 4930 },
  nasai: { nama: "Nasai", total: 5364 },
  tirmidzi: { nama: "Tirmidzi", total: 3625 },
};

/** Ejaan alternatif yang sering diketik pengguna. */
const SINONIM = {
  bukhori: "bukhari",
  buchari: "bukhari",
  muslem: "muslim",
  tirmizi: "tirmidzi",
  turmudzi: "tirmidzi",
  "ibnu majah": "ibnu-majah",
  ibnumajah: "ibnu-majah",
  majah: "ibnu-majah",
  "abu daud": "abu-dawud",
  abudawud: "abu-dawud",
  daud: "abu-dawud",
  dawud: "abu-dawud",
  nasa: "nasai",
  "an-nasai": "nasai",
  imammalik: "malik",
};

const ARBAIN_MAKS = 42;

/** Ambil JSON dengan batas waktu supaya bot tidak menggantung. */
async function ambilJson(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(WAKTU_HABIS),
    headers: { "User-Agent": "Clara-MD-Bot" },
  });
  if (!res.ok) throw new Error(`Server hadits menolak (HTTP ${res.status})`);
  const json = await res.json();
  if (!json?.status) throw new Error("Hadits tidak ditemukan");
  return json;
}

/** Samakan penulisan nama perawi. */
function normalisasiPerawi(input) {
  const raw = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!raw) return null;
  if (PERAWI[raw]) return raw;
  if (SINONIM[raw]) return SINONIM[raw];
  const tanpaSpasi = raw.replace(/\s/g, "");
  if (PERAWI[tanpaSpasi]) return tanpaSpasi;
  if (SINONIM[tanpaSpasi]) return SINONIM[tanpaSpasi];
  // Cocokkan sebagian, mis. "bukh" -> "bukhari"
  const cocok = Object.keys(PERAWI).find((k) => k.startsWith(tanpaSpasi));
  return cocok || null;
}

/** Bilangan acak 1..maks. */
function acak(maks) {
  return Math.floor(Math.random() * maks) + 1;
}

/** Potong teks panjang agar pesan WhatsApp tidak terlalu besar. */
function potong(teks, maks = 900) {
  const t = String(teks || "").trim();
  if (t.length <= maks) return t;
  return t.slice(0, maks).replace(/\s+\S*$/, "") + "...";
}

/** Rakit tampilan satu hadits. */
function susunHadits({ judul, sumber, nomor, arab, indo, catatan }, prefix) {
  const bagian = [alyaHeader(judul, "📜"), "\n\n"];

  if (arab) {
    bagian.push(bracketBox("🕌", "ᴛᴇᴋꜱ ᴀʀᴀʙ", [potong(arab, 700)]), "\n\n");
  }
  bagian.push(bracketBox("📖", "ᴛᴇʀᴊᴇᴍᴀʜ", [potong(indo, 900)]), "\n\n");

  const info = [`◦ Sumber: *${sumber}*`];
  if (nomor) info.push(`◦ Nomor: *${nomor}*`);
  if (catatan) info.push(`◦ ${catatan}`);
  bagian.push(bracketBox("ℹ️", "ꜱᴜᴍʙᴇʀ", info), "\n\n");

  bagian.push(separator(), "\n", tipText(`${prefix}hadits perawi untuk daftar kitab`));
  return bagian.join("");
}

const pluginConfig = {
  name: "hadits",
  alias: ["hadis", "hadist", "arbain"],
  category: "religi",
  description: "Hadits Arbain Nawawi & sembilan kitab perawi, Arab + terjemahan",
  usage: ".hadits [perawi] [nomor]",
  example: ".hadits bukhari 100",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const perintah = (m.command || "").toLowerCase();
    const pertama = (args[0] || "").toLowerCase();

    /* --- daftar perawi --- */
    if (["perawi", "kitab", "daftar", "list"].includes(pertama)) {
      const baris = Object.entries(PERAWI).map(
        ([slug, p]) => `◦ *${slug}* — ${p.nama} (${p.total.toLocaleString("id-ID")})`,
      );
      await m.reply(
        alyaHeader("Daftar Perawi", "📚") +
          "\n\n" +
          bracketBox("📖", "ᴋɪᴛᴀʙ", baris) +
          "\n\n" +
          bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
            `◦ *${prefix}hadits bukhari 100*`,
            `◦ *${prefix}hadits arbain 5*`,
            `◦ *${prefix}hadits* — acak`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Angka dalam kurung = jumlah hadits"),
      );
      return { handled: true };
    }

    /* --- Arbain Nawawi --- */
    const mintaArbain = perintah === "arbain" || pertama === "arbain";
    if (mintaArbain) {
      const nomorArg = perintah === "arbain" ? args[0] : args[1];
      let nomor = parseInt(nomorArg, 10);
      const acakArbain = !Number.isInteger(nomor);
      if (acakArbain) nomor = acak(ARBAIN_MAKS);

      if (!acakArbain && (nomor < 1 || nomor > ARBAIN_MAKS)) {
        await m.reply(
          alyaHeader("Nomor Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Arbain Nawawi hanya *1 sampai ${ARBAIN_MAKS}*.`,
              `◦ Contoh: *${prefix}hadits arbain 5*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Kosongkan nomor untuk hadits acak"),
        );
        return { handled: true };
      }

      const json = await ambilJson(`${BASE}/arbain/${nomor}`);
      const d = json.data || {};
      await m.reply(
        susunHadits(
          {
            judul: "Arbain Nawawi",
            sumber: "Hadits Arbain Nawawi",
            nomor: `${d.no || nomor} dari ${ARBAIN_MAKS}`,
            arab: d.arab,
            indo: d.indo || d.terjemah,
            catatan: d.judul ? `Bab: *${d.judul}*` : null,
          },
          prefix,
        ),
      );
      return { handled: true };
    }

    /* --- kitab perawi --- */
    if (pertama) {
      const slug = normalisasiPerawi(pertama);
      if (!slug) {
        await m.reply(
          alyaHeader("Perawi Tidak Dikenal", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ *${pertama.slice(0, 30)}* tidak ada dalam daftar.`,
              `◦ Lihat daftar: *${prefix}hadits perawi*`,
            ]) +
            "\n\n" +
            bracketBox("📚", "ᴛᴇʀꜱᴇᴅɪᴀ", [`◦ ${Object.keys(PERAWI).join(" · ")}`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ejaan seperti 'bukhori' juga dikenali"),
        );
        return { handled: true };
      }

      const info = PERAWI[slug];
      let nomor = parseInt(args[1], 10);
      if (!Number.isInteger(nomor)) nomor = acak(info.total);

      if (nomor < 1 || nomor > info.total) {
        await m.reply(
          alyaHeader("Nomor Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Kitab *${info.nama}* punya *${info.total.toLocaleString("id-ID")}* hadits.`,
              `◦ Masukkan nomor *1 sampai ${info.total}*.`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Kosongkan nomor untuk hadits acak"),
        );
        return { handled: true };
      }

      const json = await ambilJson(`${BASE}/${slug}/${nomor}`);
      const d = json.data || {};
      await m.reply(
        susunHadits(
          {
            judul: `Hadits ${info.nama}`,
            sumber: `HR. ${info.nama}`,
            nomor: `${d.number || nomor} dari ${info.total.toLocaleString("id-ID")}`,
            arab: d.arab,
            indo: d.id || d.indo || d.terjemah,
          },
          prefix,
        ),
      );
      return { handled: true };
    }

    /* --- acak dari perawi acak --- */
    const daftar = Object.keys(PERAWI);
    const slug = daftar[Math.floor(Math.random() * daftar.length)];
    const info = PERAWI[slug];
    const nomor = acak(info.total);
    const json = await ambilJson(`${BASE}/${slug}/${nomor}`);
    const d = json.data || {};

    await m.reply(
      susunHadits(
        {
          judul: "Hadits Pilihan",
          sumber: `HR. ${info.nama}`,
          nomor: `${d.number || nomor}`,
          arab: d.arab,
          indo: d.id || d.indo || d.terjemah,
        },
        prefix,
      ),
    );
  } catch (error) {
    const pesan = /timeout|abort/i.test(error.message)
      ? "Server hadits tidak merespons tepat waktu"
      : String(error.message).slice(0, 120);

    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${pesan}*`]) +
        "\n\n" +
        bracketBox("💡", "ꜱᴀʀᴀɴ", [
          "◦ Coba beberapa saat lagi.",
          `◦ Atau pakai *${prefix}hadits arbain*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Sumber: api.myquran.com"),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { PERAWI, SINONIM, normalisasiPerawi, potong, susunHadits, acak, ARBAIN_MAKS };
