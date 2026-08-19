// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Pilih / Random
 * ---------------------------------------------------------------
 * Pengambil keputusan serba guna: undi pilihan, lempar koin, kocok
 * dadu, acak urutan, sampai ambil angka acak.
 *
 *   .pilih bakso | mie ayam | sate
 *   .pilih koin
 *   .pilih dadu 2
 *   .pilih angka 1-100
 *   .pilih urutan andi, budi, cici
 */

import crypto from "crypto";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const MAX_OPSI = 30;
const MAX_DADU = 10;

/* ------------------------------------------------------------------ */
/* Acak                                                                */
/* ------------------------------------------------------------------ */

/**
 * Bilangan bulat acak [min, max] memakai CSPRNG tanpa modulo bias.
 * Math.random() sudah cukup untuk hiburan, tapi rejection sampling
 * membuat hasil undi benar-benar seragam.
 */
function acakInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  if (hi <= lo) return lo;

  const rentang = hi - lo + 1;
  const batas = Math.floor(0xffffffff / rentang) * rentang;
  let nilai;
  do {
    nilai = crypto.randomBytes(4).readUInt32BE(0);
  } while (nilai >= batas);
  return lo + (nilai % rentang);
}

/** Ambil satu elemen acak. */
function acakDari(list) {
  return list[acakInt(0, list.length - 1)];
}

/** Fisher-Yates, mengembalikan salinan baru. */
function kocok(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = acakInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pecah daftar pilihan. Pemisah: "|" bila ada, jika tidak koma,
 * dan sebagai upaya terakhir spasi.
 */
function pecahOpsi(teks) {
  const raw = String(teks || "").trim();
  if (!raw) return [];
  const pemisah = raw.includes("|") ? "|" : raw.includes(",") ? "," : /\s+/;
  return raw
    .split(pemisah)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_OPSI);
}

const MUKA_DADU = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/** Persentase keyakinan yang tampil di hasil undi. */
function keyakinan() {
  return acakInt(72, 99);
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "pilih",
  alias: ["random", "undi", "acak", "koin", "kocok", "hompimpa"],
  category: "fun",
  description: "Pengambil keputusan acak: undi pilihan, koin, dadu, angka, urutan",
  usage: ".pilih <opsi1 | opsi2 | ...> atau .pilih koin|dadu|angka|urutan",
  example: ".pilih bakso | mie ayam | sate",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix) {
  return (
    alyaHeader("Pengambil Keputusan", "🎲") +
    "\n\n" +
    bracketBox("🎯", "ᴜɴᴅɪ ᴘɪʟɪʜᴀɴ", [
      `◦ *${prefix}pilih bakso | mie ayam | sate*`,
      `◦ *${prefix}pilih andi, budi, cici*`,
    ]) +
    "\n\n" +
    bracketBox("🪙", "ᴍᴏᴅᴇ ʟᴀɪɴ", [
      `◦ *${prefix}pilih koin* — angka atau gambar`,
      `◦ *${prefix}pilih dadu 2* — kocok 1-${MAX_DADU} dadu`,
      `◦ *${prefix}pilih angka 1-100*`,
      `◦ *${prefix}pilih urutan a, b, c* — acak antrean`,
      `◦ *${prefix}pilih ya* — jawaban ya/tidak`,
    ]) +
    "\n\n" +
    bracketBox("💡", "ɪɴꜰᴏ", [
      `◦ Maksimal *${MAX_OPSI}* opsi sekali undi.`,
      "◦ Memakai pengacak kriptografis, benar-benar adil.",
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Pisahkan opsi dengan | atau koma")
  );
}

async function handler(m, { config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const teks = (m.text || "").trim();
    const perintah = (m.command || "").toLowerCase();
    const kataPertama = teks.split(/\s+/)[0]?.toLowerCase() || "";
    const sisa = teks.split(/\s+/).slice(1).join(" ").trim();

    // Alias .koin dan .dadu langsung masuk modenya
    const mode =
      perintah === "koin"
        ? "koin"
        : perintah === "dadu"
          ? "dadu"
          : perintah === "kocok"
            ? "urutan"
            : kataPertama;

    // Argumen mode bergantung apakah mode datang dari alias atau kata pertama
    const argMode = ["koin", "dadu", "kocok"].includes(perintah) ? teks : sisa;

    if (!teks && !["koin", "dadu"].includes(perintah)) {
      await m.reply(helpText(prefix));
      return { handled: true };
    }

    /* --- koin --- */
    if (mode === "koin" || mode === "flip" || mode === "lemparkoin") {
      const hasil = acakInt(0, 1) === 0;
      await m.reply(
        alyaHeader("Lempar Koin", "🪙") +
          "\n\n" +
          bracketBox("🎰", "ʜᴀꜱɪʟ", [
            `◦ Koin berputar...`,
            `◦ Mendarat di: *${hasil ? "ANGKA 🔢" : "GAMBAR 🖼️"}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Peluang tepat 50 : 50"),
      );
      return { handled: true };
    }

    /* --- dadu --- */
    if (mode === "dadu" || mode === "dice") {
      let jumlah = parseInt(argMode, 10);
      if (!Number.isInteger(jumlah) || jumlah < 1) jumlah = 1;
      if (jumlah > MAX_DADU) jumlah = MAX_DADU;

      const lempar = Array.from({ length: jumlah }, () => acakInt(1, 6));
      const total = lempar.reduce((a, b) => a + b, 0);
      const muka = lempar.map((n) => MUKA_DADU[n - 1]).join(" ");

      const baris = [`◦ ${muka}`, `◦ Angka: *${lempar.join(" + ")}*`];
      if (jumlah > 1) {
        baris.push(`◦ Total: *${total}*`);
        baris.push(`◦ Rata-rata: *${(total / jumlah).toFixed(1)}*`);
      }

      await m.reply(
        alyaHeader(`Kocok ${jumlah} Dadu`, "🎲") +
          "\n\n" +
          bracketBox("🎲", "ʜᴀꜱɪʟ", baris) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}pilih dadu 3 untuk lebih banyak dadu`),
      );
      return { handled: true };
    }

    /* --- angka acak --- */
    if (mode === "angka" || mode === "number" || mode === "nomor") {
      const cocok = argMode.match(/(-?\d+)\s*(?:-|s\/d|sampai|to)\s*(-?\d+)/);
      let min = 1;
      let max = 100;
      if (cocok) {
        min = parseInt(cocok[1], 10);
        max = parseInt(cocok[2], 10);
      } else {
        const satu = parseInt(argMode, 10);
        if (Number.isInteger(satu)) max = satu;
      }
      if (min > max) [min, max] = [max, min];
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        min = 1;
        max = 100;
      }
      if (max - min > 1_000_000_000) max = min + 1_000_000_000;

      const hasil = acakInt(min, max);
      await m.reply(
        alyaHeader("Angka Acak", "🔢") +
          "\n\n" +
          bracketBox("🎯", "ʜᴀꜱɪʟ", [
            `◦ Rentang: *${min} – ${max}*`,
            `◦ Angka terpilih: *${hasil}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}pilih angka 1-6 untuk rentang lain`),
      );
      return { handled: true };
    }

    /* --- acak urutan --- */
    if (mode === "urutan" || mode === "antrean" || mode === "shuffle") {
      const opsi = pecahOpsi(argMode);
      if (opsi.length < 2) {
        await m.reply(
          alyaHeader("Kurang Opsi", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              "◦ Minimal *2 nama* untuk diacak.",
              `◦ Contoh: *${prefix}pilih urutan andi, budi, cici*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Pisahkan dengan koma atau |"),
        );
        return { handled: true };
      }

      const hasil = kocok(opsi);
      const lines = hasil.map(
        (n, i) => `◦ ${String(i + 1).padStart(2, "0")}. *${n.slice(0, 40)}*`,
      );

      await m.reply(
        alyaHeader("Urutan Acak", "🔀") +
          "\n\n" +
          bracketBox("📋", "ᴀɴᴛʀᴇᴀɴ", lines) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [
            `◦ Jumlah: *${hasil.length} nama*`,
            `◦ Giliran pertama: *${hasil[0].slice(0, 40)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Cocok untuk menentukan giliran presentasi"),
      );
      return { handled: true };
    }

    /* --- ya / tidak --- */
    if (["ya", "yatidak", "yesno", "apakah"].includes(mode)) {
      const jawaban = [
        "Ya, tentu saja ✅",
        "Sepertinya iya 👍",
        "Kemungkinan besar ya 🙂",
        "Hmm... belum pasti 🤔",
        "Sebaiknya tanya lagi nanti ⏳",
        "Sepertinya tidak 👎",
        "Tidak ❌",
        "Jelas tidak 🙅",
      ];
      const pertanyaan = argMode ? argMode.slice(0, 80) : "Pertanyaanmu";
      await m.reply(
        alyaHeader("Ya atau Tidak", "🔮") +
          "\n\n" +
          bracketBox("❓", "ᴘᴇʀᴛᴀɴʏᴀᴀɴ", [`◦ ${pertanyaan}`]) +
          "\n\n" +
          bracketBox("🔮", "ᴊᴀᴡᴀʙᴀɴ", [
            `◦ *${acakDari(jawaban)}*`,
            `◦ Keyakinan: *${keyakinan()}%*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Hanya hiburan, keputusan tetap di tanganmu"),
      );
      return { handled: true };
    }

    /* --- undi pilihan biasa --- */
    const opsi = pecahOpsi(teks);
    if (opsi.length < 2) {
      await m.reply(
        alyaHeader("Kurang Opsi", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            "◦ Butuh minimal *2 pilihan*.",
            `◦ Contoh: *${prefix}pilih bakso | mie ayam*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}pilih untuk melihat semua mode`),
      );
      return { handled: true };
    }

    const menang = acakDari(opsi);
    const peluang = (100 / opsi.length).toFixed(1);
    const daftar = opsi
      .slice(0, 12)
      .map((o) => `◦ ${o === menang ? "👉" : "  "} ${o.slice(0, 40)}`);

    await m.reply(
      alyaHeader("Hasil Undian", "🎯") +
        "\n\n" +
        bracketBox("📋", "ᴘɪʟɪʜᴀɴ", daftar) +
        "\n\n" +
        bracketBox("🏆", "ᴛᴇʀᴘɪʟɪʜ", [
          `◦ *${menang.slice(0, 60)}*`,
          `◦ Peluang tiap opsi: *${peluang}%*`,
          `◦ Keyakinan bot: *${keyakinan()}%*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Undi ulang bila belum sreg 😄"),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}pilih untuk bantuan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { acakInt, acakDari, kocok, pecahOpsi, MAX_OPSI, MAX_DADU };
