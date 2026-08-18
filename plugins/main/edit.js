/**
 * Edit Foto
 * ---------------------------------------------------------------
 * Filter gambar yang diproses langsung di server memakai sharp,
 * jadi tidak bergantung pada API pihak ketiga dan tetap jalan
 * walau internet sedang bermasalah.
 *
 *   .edit blur         .edit grayscale     .edit sketsa
 *   .edit pixelate 20  .edit putar 90      .edit sepia
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  cariMedia,
  unduhMedia,
  ukuranTeks,
  batasiDimensi,
} from "../../src/lib/clara-media-util.js";

const pluginConfig = {
  name: "edit",
  alias: ["editfoto", "filter", "efek", "editgambar"],
  category: "maker",
  description: "Filter foto: blur, sensor, hitam putih, sepia, sketsa, putar, dan lainnya",
  usage: ".edit <efek> [nilai]",
  example: ".edit blur 10",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 0,
  isEnabled: true,
};

/**
 * Daftar efek. Setiap fungsi menerima instance sharp dan angka
 * opsional, lalu mengembalikan instance sharp lagi.
 */
const EFEK = {
  blur: {
    ikon: "🌫️",
    nama: "Blur",
    ket: "Buramkan gambar",
    argKet: "kekuatan 1-50",
    jalan: (img, n) => img.blur(Math.min(50, Math.max(0.3, n || 8))),
  },
  pixelate: {
    ikon: "🟦",
    nama: "Pixelate",
    ket: "Sensor kotak-kotak",
    argKet: "ukuran 5-60",
    jalan: async (img, n, meta) => {
      const level = Math.min(60, Math.max(5, n || 20));
      const kecil = Math.max(8, Math.round(meta.lebar / level));
      const buf = await img.resize(kecil, null, { kernel: "nearest" }).toBuffer();
      const sharp = (await import("sharp")).default;
      return sharp(buf).resize(meta.lebar, meta.tinggi, { kernel: "nearest" });
    },
  },
  grayscale: {
    ikon: "⚫",
    nama: "Hitam Putih",
    ket: "Buang semua warna",
    jalan: (img) => img.grayscale(),
  },
  sepia: {
    ikon: "🟤",
    nama: "Sepia",
    ket: "Nuansa foto jadul",
    jalan: (img) =>
      img.recomb([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131],
      ]),
  },
  invert: {
    ikon: "🔃",
    nama: "Invert",
    ket: "Balik warna jadi negatif",
    jalan: (img) => img.negate({ alpha: false }),
  },
  sketsa: {
    ikon: "✏️",
    nama: "Sketsa",
    ket: "Seperti gambar pensil",
    jalan: (img) =>
      img
        .grayscale()
        .normalise()
        // Kernel deteksi tepi, lalu dibalik agar garis jadi hitam
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
        })
        .negate({ alpha: false })
        .modulate({ brightness: 1.1 }),
  },
  tajam: {
    ikon: "🔪",
    nama: "Pertajam",
    ket: "Perjelas detail",
    argKet: "kekuatan 1-10",
    jalan: (img, n) => img.sharpen({ sigma: Math.min(10, Math.max(0.5, n || 2)) }),
  },
  cerah: {
    ikon: "☀️",
    nama: "Cerahkan",
    ket: "Naikkan kecerahan",
    argKet: "1-200 persen",
    jalan: (img, n) => img.modulate({ brightness: 1 + Math.min(2, Math.max(0.05, (n || 30) / 100)) }),
  },
  gelap: {
    ikon: "🌙",
    nama: "Gelapkan",
    ket: "Turunkan kecerahan",
    argKet: "1-90 persen",
    jalan: (img, n) => img.modulate({ brightness: Math.max(0.1, 1 - Math.min(0.9, (n || 30) / 100)) }),
  },
  jenuh: {
    ikon: "🌈",
    nama: "Saturasi",
    ket: "Pekatkan warna",
    argKet: "1-300 persen",
    jalan: (img, n) => img.modulate({ saturation: Math.min(3, Math.max(0.1, (n || 180) / 100)) }),
  },
  putar: {
    ikon: "🔄",
    nama: "Putar",
    ket: "Putar gambar",
    argKet: "derajat 90/180/270",
    jalan: (img, n) => img.rotate(((Math.round((n || 90) / 90) * 90) % 360) || 90),
  },
  mirror: {
    ikon: "🪞",
    nama: "Cermin",
    ket: "Balik kiri-kanan",
    jalan: (img) => img.flop(),
  },
  balik: {
    ikon: "🙃",
    nama: "Jungkir",
    ket: "Balik atas-bawah",
    jalan: (img) => img.flip(),
  },
};

/** Susun teks daftar efek untuk panduan. */
function daftarEfek() {
  return Object.entries(EFEK).map(
    ([kunci, e]) => `◦ ${e.ikon} *${kunci}* — ${e.ket}`,
  );
}

function panduan(prefix) {
  return (
    alyaHeader("Edit Foto", "🎨") +
    "\n\n" +
    bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
      `◦ Kirim foto + caption *${prefix}edit <efek>*`,
      `◦ Atau reply foto dengan *${prefix}edit <efek>*`,
    ]) +
    "\n\n" +
    bracketBox("🎨", "ᴅᴀꜰᴛᴀʀ ᴇꜰᴇᴋ", daftarEfek()) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}edit blur 15`,
      `◦ ${prefix}edit pixelate 30`,
      `◦ ${prefix}edit putar 180`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Diproses di server, tanpa API luar")
  );
}

async function handler(m, { sock, config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const pilihan = (args[0] || "").toLowerCase();
    const angka = parseFloat(args[1]);

    if (!pilihan || !EFEK[pilihan]) {
      await m.reply(panduan(prefix));
      return { handled: true };
    }

    const media = cariMedia(m, ["image", "sticker"]);
    if (!media) {
      await m.reply(
        alyaHeader("Foto Mana?", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            "◦ Tidak ada gambar yang bisa diedit.",
            `◦ Kirim foto + caption *${prefix}edit ${pilihan}*`,
            "◦ Atau reply foto yang sudah terkirim.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Sticker diam juga bisa diedit"),
      );
      return { handled: true };
    }

    const efek = EFEK[pilihan];
    await m.reply(
      alyaHeader("Memproses", "⏳") +
        "\n\n" +
        bracketBox(efek.ikon, "ᴇꜰᴇᴋ", [
          `◦ Menerapkan *${efek.nama}*...`,
          "◦ Mohon tunggu sebentar.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Foto besar butuh waktu lebih lama"),
    );

    const buffer = await unduhMedia(media);
    const sharp = (await import("sharp")).default;

    const asli = await sharp(buffer).metadata();
    const dim = batasiDimensi(asli.width, asli.height);

    let img = sharp(buffer, { failOn: "none" });
    // Gambar raksasa dikecilkan dulu agar tidak menghabiskan memori
    if (dim.diubah) img = img.resize(dim.lebar, dim.tinggi, { fit: "inside" });

    const meta = { lebar: dim.lebar || asli.width, tinggi: dim.tinggi || asli.height };
    img = await efek.jalan(img, Number.isFinite(angka) ? angka : null, meta);

    const hasil = await img.jpeg({ quality: 90 }).toBuffer();
    const jadi = await sharp(hasil).metadata();

    const rincian = [
      `◦ Efek: *${efek.nama}*`,
      `◦ Ukuran: *${jadi.width} x ${jadi.height} px*`,
      `◦ Berkas: *${ukuranTeks(hasil.length)}*`,
    ];
    if (Number.isFinite(angka) && efek.argKet) {
      rincian.push(`◦ Nilai: *${angka}*`);
    }
    if (dim.diubah) {
      rincian.push(`◦ Dikecilkan dari *${asli.width}x${asli.height}*`);
    }

    await sock.sendMessage(
      m.chat,
      {
        image: hasil,
        caption:
          alyaHeader("Hasil Edit", efek.ikon) +
          "\n\n" +
          bracketBox("📊", "ᴅᴇᴛᴀɪʟ", rincian) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Coba efek lain: ${prefix}edit untuk daftar`),
      },
      { quoted: m },
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        bracketBox("💡", "ꜱᴀʀᴀɴ", [
          "◦ Pastikan berkas benar-benar gambar.",
          "◦ Gambar animasi tidak didukung untuk efek ini.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}edit untuk daftar efek`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { EFEK, daftarEfek, panduan };
