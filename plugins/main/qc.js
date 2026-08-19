// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Quote Chat (QC)
 * ---------------------------------------------------------------
 * Mengubah teks menjadi gambar gelembung chat lalu mengirimnya
 * sebagai sticker. Digambar sendiri dengan canvas, tidak memakai
 * API luar, jadi tetap jalan tanpa koneksi ke layanan pihak ketiga.
 *
 *   .qc halo semua
 *   .qc              (reply pesan yang mau dikutip)
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { jalurTemp, bersihkan, ukuranTeks } from "../../src/lib/clara-media-util.js";

const LEBAR = 512;
const PAD = 28;
const MAKS_HURUF = 220;

/** Warna avatar diambil dari nama supaya konsisten per orang. */
const WARNA_AVATAR = [
  "#e57373", "#f06292", "#ba68c8", "#9575cd", "#7986cb",
  "#64b5f6", "#4fc3f7", "#4dd0e1", "#4db6ac", "#81c784",
  "#aed581", "#ffb74d", "#ff8a65", "#a1887f",
];

/**
 * Hash FNV-1a 32-bit. Penjumlahan sederhana terlalu sering
 * bertabrakan (mis. "Budi" dan "Ani" dapat warna sama), sedangkan
 * FNV-1a menyebar jauh lebih rata untuk nama-nama pendek.
 */
function warnaDariNama(nama) {
  const t = String(nama || "?");
  let hash = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) {
    hash ^= t.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return WARNA_AVATAR[hash % WARNA_AVATAR.length];
}

/** Huruf pertama untuk avatar bulat. */
function inisial(nama) {
  const bersih = String(nama || "?").trim();
  if (!bersih) return "?";
  const kata = bersih.split(/\s+/).filter(Boolean);
  const satu = (kata[0] || "?")[0] || "?";
  const dua = kata.length > 1 ? kata[1][0] : "";
  return (satu + dua).toUpperCase().slice(0, 2);
}

/**
 * Pecah teks menjadi baris yang muat pada lebar tertentu.
 * Kata yang lebih panjang dari satu baris dipenggal paksa.
 */
function bungkusTeks(ctx, teks, lebarMaks) {
  const hasil = [];
  for (const paragraf of String(teks).split("\n")) {
    if (!paragraf.trim()) {
      hasil.push("");
      continue;
    }
    let baris = "";
    for (const kata of paragraf.split(/\s+/)) {
      const coba = baris ? `${baris} ${kata}` : kata;
      if (ctx.measureText(coba).width <= lebarMaks) {
        baris = coba;
        continue;
      }
      if (baris) hasil.push(baris);
      // Kata tunggal kepanjangan: penggal per huruf
      if (ctx.measureText(kata).width > lebarMaks) {
        let potongan = "";
        for (const huruf of kata) {
          if (ctx.measureText(potongan + huruf).width > lebarMaks) {
            hasil.push(potongan);
            potongan = huruf;
          } else {
            potongan += huruf;
          }
        }
        baris = potongan;
      } else {
        baris = kata;
      }
    }
    if (baris) hasil.push(baris);
  }
  return hasil.length ? hasil : [""];
}

/** Persegi panjang bersudut tumpul. */
function kotakBulat(ctx, x, y, l, t, r) {
  const jari = Math.min(r, l / 2, t / 2);
  ctx.beginPath();
  ctx.moveTo(x + jari, y);
  ctx.lineTo(x + l - jari, y);
  ctx.quadraticCurveTo(x + l, y, x + l, y + jari);
  ctx.lineTo(x + l, y + t - jari);
  ctx.quadraticCurveTo(x + l, y + t, x + l - jari, y + t);
  ctx.lineTo(x + jari, y + t);
  ctx.quadraticCurveTo(x, y + t, x, y + t - jari);
  ctx.lineTo(x, y + jari);
  ctx.quadraticCurveTo(x, y, x, y + jari);
  ctx.closePath();
}

/**
 * Gambar gelembung chat dan kembalikan PNG buffer.
 * @returns {Promise<Buffer>}
 */
async function gambarQuote({ nama, teks, jam }) {
  const { createCanvas } = await import("@napi-rs/canvas");

  // Kanvas sementara hanya untuk mengukur teks
  const ukur = createCanvas(10, 10).getContext("2d");
  const fontTeks = "26px sans-serif";
  const fontNama = "bold 22px sans-serif";

  const avatarD = 64;
  const kiriIsi = PAD + avatarD + 18;
  const lebarIsi = LEBAR - kiriIsi - PAD - 24;

  ukur.font = fontTeks;
  const baris = bungkusTeks(ukur, teks, lebarIsi);
  const tinggiBaris = 34;

  const tinggiGelembung = 26 + 30 + baris.length * tinggiBaris + 22;
  const tinggi = Math.max(avatarD + PAD * 2, tinggiGelembung + PAD * 2);

  const canvas = createCanvas(LEBAR, tinggi);
  const ctx = canvas.getContext("2d");

  // Latar transparan supaya rapi saat jadi sticker
  ctx.clearRect(0, 0, LEBAR, tinggi);

  // Gelembung
  const gx = kiriIsi - 14;
  const gy = PAD;
  const gl = LEBAR - gx - PAD;
  ctx.fillStyle = "#1f2c34";
  kotakBulat(ctx, gx, gy, gl, tinggiGelembung, 22);
  ctx.fill();

  // Ekor gelembung di kiri atas
  ctx.beginPath();
  ctx.moveTo(gx, gy + 16);
  ctx.lineTo(gx - 13, gy + 8);
  ctx.lineTo(gx, gy + 34);
  ctx.closePath();
  ctx.fillStyle = "#1f2c34";
  ctx.fill();

  // Avatar bulat berisi inisial
  const ax = PAD;
  const ay = PAD;
  ctx.save();
  ctx.beginPath();
  ctx.arc(ax + avatarD / 2, ay + avatarD / 2, avatarD / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = warnaDariNama(nama);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(inisial(nama), ax + avatarD / 2, ay + avatarD / 2 + 1);
  ctx.restore();

  // Nama pengirim
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = fontNama;
  ctx.fillStyle = warnaDariNama(nama);
  ctx.fillText(String(nama).slice(0, 28), kiriIsi, gy + 34);

  // Isi pesan
  ctx.font = fontTeks;
  ctx.fillStyle = "#e9edef";
  baris.forEach((b, i) => {
    ctx.fillText(b, kiriIsi, gy + 34 + 30 + i * tinggiBaris);
  });

  // Jam di pojok kanan bawah gelembung
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#8696a0";
  ctx.textAlign = "right";
  ctx.fillText(jam, gx + gl - 16, gy + tinggiGelembung - 14);

  return canvas.toBuffer("image/png");
}

/** Jam sekarang dalam WIB, format 24 jam. */
function jamWib() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

const pluginConfig = {
  name: "qc",
  alias: ["quotechat", "quotly", "qchat", "fakechat"],
  category: "maker",
  description: "Ubah teks jadi sticker gelembung chat",
  usage: ".qc <teks> atau reply pesan dengan .qc",
  example: ".qc halo semua",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    // Teks bisa dari argumen atau dari pesan yang di-reply
    const dariReply = m.quoted?.text || m.quoted?.body || "";
    const teks = (m.text || "").trim() || String(dariReply).trim();

    if (!teks) {
      await m.reply(
        alyaHeader("Quote Chat", "💬") +
          "\n\n" +
          bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
            `◦ *${prefix}qc halo semua*`,
            `◦ Reply pesan lalu ketik *${prefix}qc*`,
          ]) +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            `◦ Maksimal *${MAKS_HURUF} huruf*.`,
            "◦ Hasilnya berupa sticker.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Digambar sendiri, tanpa API luar"),
      );
      return { handled: true };
    }

    if (teks.length > MAKS_HURUF) {
      await m.reply(
        alyaHeader("Terlalu Panjang", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            `◦ Teks *${teks.length} huruf*, maksimal *${MAKS_HURUF}*.`,
            "◦ Persingkat dulu ya.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Pesan pendek lebih enak dibaca sebagai sticker"),
      );
      return { handled: true };
    }

    // Nama diambil dari pengirim asli bila membalas pesan orang lain
    const nama =
      (m.quoted && !m.text ? m.quoted.pushName || m.quoted.name : null) ||
      m.pushName ||
      "Pengguna";

    const png = await gambarQuote({ nama, teks, jam: jamWib() });

    // Sticker WhatsApp harus WebP
    const sharp = (await import("sharp")).default;
    const webp = await sharp(png)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();

    await sock.sendMessage(m.chat, { sticker: webp }, { quoted: m });
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}qc untuk panduan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export {
  gambarQuote,
  bungkusTeks,
  inisial,
  warnaDariNama,
  kotakBulat,
  jamWib,
  MAKS_HURUF,
};
