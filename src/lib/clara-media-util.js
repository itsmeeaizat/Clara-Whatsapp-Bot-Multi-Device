/**
 * Clara Media Util
 * ---------------------------------------------------------------
 * Helper bersama untuk plugin yang mengolah gambar, sticker, dan
 * video. Dipisah supaya plugin tidak menyalin logika unduh/konversi.
 *
 * Catatan penting soal WebP animasi
 * ---------------------------------
 * ffmpeg bawaan repo ini (@ffmpeg-installer, build 2018) TIDAK bisa
 * men-decode WebP animasi — ia melewati chunk ANIM/ANMF lalu gagal
 * dengan "image data not found". Karena itu sticker gerak dibongkar
 * memakai sharp (libwebp 1.3.2) menjadi GIF lebih dulu, baru GIF
 * diberikan ke ffmpeg. Jangan menyuapkan .webp animasi langsung ke
 * ffmpeg, hasilnya pasti gagal.
 */

import fs from "fs";
import path from "path";
import { execFile } from "child_process";

const TMP_DIR = path.join(process.cwd(), "tmp");

/** Batas aman supaya bot tidak kehabisan memori / kena timeout. */
const BATAS = {
  ukuranMasuk: 25 * 1024 * 1024, // 25 MB
  dimensiMaks: 4096,
  durasiFfmpeg: 60_000, // 60 detik
  unduhMs: 45_000,
};

function pastikanTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

/** Path file sementara yang unik. */
function jalurTemp(ext) {
  pastikanTmp();
  const acak = Math.random().toString(16).slice(2, 10);
  return path.join(TMP_DIR, `clara_${Date.now()}_${acak}${ext}`);
}

/** Hapus berkas tanpa pernah melempar error. */
function bersihkan(...berkas) {
  for (const f of berkas.flat()) {
    if (!f) continue;
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {
      /* berkas sementara, abaikan */
    }
  }
}

/* ------------------------------------------------------------------ */
/* Pengambilan media dari pesan                                        */
/* ------------------------------------------------------------------ */

/**
 * Cari media pada pesan ini atau pada pesan yang di-reply.
 * @returns {{sumber:"quoted"|"pesan", jenis:string, mime:string, unduh:Function}|null}
 */
function cariMedia(m, jenisDiterima = ["image", "video", "sticker"]) {
  const kandidat = [];

  if (m?.quoted?.isMedia) {
    kandidat.push({
      sumber: "quoted",
      pesan: m.quoted.message,
      unduh: () => m.quoted.download(),
    });
  }
  if (m?.isMedia) {
    kandidat.push({
      sumber: "pesan",
      pesan: m.message,
      unduh: () => m.download(),
    });
  }

  for (const k of kandidat) {
    const pesan = k.pesan || {};
    const peta = {
      image: pesan.imageMessage,
      video: pesan.videoMessage,
      sticker: pesan.stickerMessage,
      document: pesan.documentMessage,
      audio: pesan.audioMessage,
    };
    for (const jenis of jenisDiterima) {
      const isi = peta[jenis];
      if (!isi) continue;
      return {
        sumber: k.sumber,
        jenis,
        mime: isi.mimetype || "",
        detik: isi.seconds || 0,
        animasi: Boolean(isi.isAnimated || isi.gifPlayback),
        unduh: k.unduh,
      };
    }
  }
  return null;
}

/** Unduh media dengan batas ukuran dan batas waktu. */
async function unduhMedia(media) {
  if (!media?.unduh) throw new Error("Media tidak ditemukan");

  const buffer = await Promise.race([
    media.unduh(),
    new Promise((_, tolak) =>
      setTimeout(() => tolak(new Error("Waktu unduh habis")), BATAS.unduhMs),
    ),
  ]);

  if (!buffer || !buffer.length) throw new Error("Media kosong atau gagal diunduh");
  if (buffer.length > BATAS.ukuranMasuk) {
    throw new Error(
      `Media terlalu besar (${(buffer.length / 1048576).toFixed(1)} MB, maksimal 25 MB)`,
    );
  }
  return buffer;
}

/* ------------------------------------------------------------------ */
/* ffmpeg                                                              */
/* ------------------------------------------------------------------ */

/** Ambil path biner ffmpeg. Modul ini ESM murni, jadi harus import(). */
async function pathFfmpeg() {
  const mod = await import("@ffmpeg-installer/ffmpeg");
  const p = (mod.default || mod).path;
  if (!p || !fs.existsSync(p)) throw new Error("ffmpeg tidak tersedia");
  return p;
}

/** Jalankan ffmpeg dengan timeout keras. Selalu reject bila gagal. */
async function jalankanFfmpeg(args, timeout = BATAS.durasiFfmpeg) {
  const ffPath = await pathFfmpeg();

  return new Promise((selesai, tolak) => {
    execFile(ffPath, args, { timeout, maxBuffer: 1024 * 1024 * 16 }, (err, _out, errOut) => {
      if (err) {
        const pesan = String(errOut || err.message)
          .split("\n")
          .filter((b) => /error|invalid|failed|no such/i.test(b))
          .slice(-1)[0];
        return tolak(new Error(pesan ? pesan.trim().slice(0, 150) : "Konversi gagal"));
      }
      selesai(true);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Konversi                                                            */
/* ------------------------------------------------------------------ */

/** Baca info WebP: berapa frame, ukuran, animasi atau bukan. */
async function infoWebp(buffer) {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(buffer, { animated: true }).metadata();
  const frame = meta.pages || 1;
  return {
    lebar: meta.width || 0,
    tinggi: meta.pageHeight || meta.height || 0,
    frame,
    animasi: frame > 1,
    delay: meta.delay || [],
    format: meta.format || "webp",
    ukuran: buffer.length,
  };
}

/**
 * Sticker (WebP) -> GIF. Menangani animasi maupun diam.
 * @returns {Promise<Buffer>}
 */
async function webpKeGif(buffer) {
  const sharp = (await import("sharp")).default;
  return sharp(buffer, { animated: true }).gif().toBuffer();
}

/**
 * Sticker (WebP) -> MP4, lewat GIF karena ffmpeg lawas tidak bisa
 * membaca WebP animasi secara langsung.
 * @returns {Promise<Buffer>}
 */
async function webpKeMp4(buffer) {
  const gif = await webpKeGif(buffer);
  const masuk = jalurTemp(".gif");
  const keluar = jalurTemp(".mp4");

  try {
    fs.writeFileSync(masuk, gif);
    await jalankanFfmpeg([
      "-y",
      "-i",
      masuk,
      "-movflags",
      "faststart",
      "-pix_fmt",
      "yuv420p",
      // Dimensi wajib genap untuk H.264
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      keluar,
    ]);
    if (!fs.existsSync(keluar)) throw new Error("Hasil konversi tidak terbentuk");
    return fs.readFileSync(keluar);
  } finally {
    bersihkan(masuk, keluar);
  }
}

/** Sticker diam -> PNG (ambil frame pertama). */
async function webpKePng(buffer) {
  const sharp = (await import("sharp")).default;
  return sharp(buffer).png().toBuffer();
}

/* ------------------------------------------------------------------ */
/* Format                                                              */
/* ------------------------------------------------------------------ */

/** Ubah byte jadi teks yang enak dibaca. */
function ukuranTeks(byte) {
  const n = Number(byte) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

/** Batasi dimensi agar tidak melampaui batas aman. */
function batasiDimensi(lebar, tinggi, maks = BATAS.dimensiMaks) {
  const l = Number(lebar) || 0;
  const t = Number(tinggi) || 0;
  if (l <= maks && t <= maks) return { lebar: l, tinggi: t, diubah: false };
  const rasio = Math.min(maks / l, maks / t);
  return {
    lebar: Math.max(1, Math.floor(l * rasio)),
    tinggi: Math.max(1, Math.floor(t * rasio)),
    diubah: true,
  };
}

export {
  pathFfmpeg,
  cariMedia,
  unduhMedia,
  jalankanFfmpeg,
  infoWebp,
  webpKeGif,
  webpKeMp4,
  webpKePng,
  jalurTemp,
  bersihkan,
  ukuranTeks,
  batasiDimensi,
  pastikanTmp,
  BATAS,
  TMP_DIR,
};
