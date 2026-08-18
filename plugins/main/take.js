/**
 * Take Sticker
 * ---------------------------------------------------------------
 * Menulis ulang nama paket dan pembuat pada sticker yang di-reply,
 * tanpa mengubah gambarnya sama sekali. Sticker gerak tetap gerak
 * karena berkas WebP-nya tidak dikodekan ulang.
 *
 *   .take                       pakai nama pengirim
 *   .take Clara                 ganti nama paket
 *   .take Clara | Aizat         paket dan pembuat
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
  infoWebp,
  ukuranTeks,
} from "../../src/lib/clara-media-util.js";

const pluginConfig = {
  name: "take",
  alias: ["wm", "watermark", "rename", "takestick"],
  category: "sticker",
  description: "Ganti nama paket & pembuat pada sticker tanpa mengubah gambarnya",
  usage: ".take <nama paket> | <pembuat>",
  example: ".take Clara MD | Aizat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 0,
  isEnabled: true,
};

/**
 * Susun chunk EXIF berisi metadata sticker WhatsApp.
 * Header 22 byte di bawah ini adalah format baku yang dibaca
 * WhatsApp; hanya panjang JSON-nya yang berubah (offset 14-17).
 */
function bangunExif(paket, pembuat, emojis = []) {
  const data = {
    "sticker-pack-id": `clara-md-${Date.now()}`,
    "sticker-pack-name": String(paket || "").slice(0, 60),
    "sticker-pack-publisher": String(pembuat || "").slice(0, 60),
    emojis: Array.isArray(emojis) ? emojis.slice(0, 8) : [],
  };

  const json = Buffer.from(JSON.stringify(data), "utf8");
  const header = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const exif = Buffer.concat([header, json]);
  // Panjang JSON ditulis little-endian pada offset 14
  exif.writeUIntLE(json.length, 14, 4);
  return exif;
}

/** Tempelkan metadata baru ke berkas WebP yang sudah ada. */
async function tempelExif(buffer, paket, pembuat, emojis) {
  const webpmux = await import("node-webpmux");
  const Image = (webpmux.default || webpmux).Image;
  const img = new Image();
  await img.load(buffer);
  img.exif = bangunExif(paket, pembuat, emojis);
  return img.save(null);
}

/** Pisahkan "paket | pembuat" jadi dua bagian. */
function pecahNama(teks, bawaanPaket, bawaanPembuat) {
  const raw = String(teks || "").trim();
  if (!raw) return { paket: bawaanPaket, pembuat: bawaanPembuat };

  const bagian = raw.split("|").map((s) => s.trim());
  return {
    paket: (bagian[0] || bawaanPaket).slice(0, 60),
    pembuat: (bagian[1] || bawaanPembuat).slice(0, 60),
  };
}

async function handler(m, { sock, config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const media = cariMedia(m, ["sticker"]);
    if (!media) {
      await m.reply(
        alyaHeader("Take Sticker", "🏷️") +
          "\n\n" +
          bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
            `◦ Reply sticker dengan *${prefix}take*`,
            `◦ *${prefix}take Nama Paket*`,
            `◦ *${prefix}take Nama Paket | Pembuat*`,
          ]) +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            "◦ Hanya label yang diganti.",
            "◦ Gambar dan animasi *tidak* dikodekan ulang,",
            "  jadi kualitasnya tetap sama persis.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Cek metadata dengan ${prefix}stickerinfo`),
      );
      return { handled: true };
    }

    const namaPengirim = m.pushName || "Pengguna";
    const namaBot = botConfig?.bot?.name || "Clara MD";
    const { paket, pembuat } = pecahNama(m.text, namaPengirim, namaBot);

    const buffer = await unduhMedia(media);
    const info = await infoWebp(buffer);
    const hasil = await tempelExif(buffer, paket, pembuat);

    await sock.sendMessage(m.chat, { sticker: hasil }, { quoted: m });

    await m.reply(
      alyaHeader("Berhasil Diambil", "🏷️") +
        "\n\n" +
        bracketBox("✅", "ᴍᴇᴛᴀᴅᴀᴛᴀ ʙᴀʀᴜ", [
          `◦ Paket: *${paket}*`,
          `◦ Pembuat: *${pembuat}*`,
        ]) +
        "\n\n" +
        bracketBox("📊", "ʙᴇʀᴋᴀꜱ", [
          `◦ Jenis: *${info.animasi ? "Sticker gerak" : "Sticker diam"}*`,
          `◦ Dimensi: *${info.lebar} x ${info.tinggi} px*`,
          `◦ Ukuran: *${ukuranTeks(hasil.length)}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Gambar asli tidak diubah sedikit pun"),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}take untuk panduan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { bangunExif, tempelExif, pecahNama };
