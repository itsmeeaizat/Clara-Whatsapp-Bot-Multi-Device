/**
 * Info Sticker
 * ---------------------------------------------------------------
 * Membaca metadata sticker: pembuat, nama paket, jumlah frame,
 * dimensi, ukuran berkas, dan emoji yang tertanam.
 *
 *   .stickerinfo   (reply sticker)
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
  name: "stickerinfo",
  alias: ["infosticker", "infostiker", "stickerdetail", "cekstiker"],
  category: "sticker",
  description: "Lihat metadata sticker: pembuat, paket, frame, dan ukuran",
  usage: "Reply sticker dengan .stickerinfo",
  example: ".stickerinfo (reply sticker)",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

/**
 * Baca metadata EXIF sticker WhatsApp. Datanya disimpan sebagai
 * JSON di dalam chunk EXIF WebP, bukan EXIF gambar biasa.
 * @returns {Promise<object|null>}
 */
async function bacaExifSticker(buffer) {
  try {
    const webpmux = await import("node-webpmux");
    const Image = (webpmux.default || webpmux).Image;
    const img = new Image();
    await img.load(buffer);
    if (!img.exif) return null;

    // 22 byte pertama adalah header EXIF, sisanya JSON UTF-8
    const teks = img.exif.slice(22).toString("utf8").replace(/\0+$/, "");
    if (!teks.trim().startsWith("{")) return null;
    return JSON.parse(teks);
  } catch {
    return null;
  }
}

function ringkasNama(nilai, fallback = "tidak diketahui") {
  const t = String(nilai ?? "").trim();
  return t ? t.slice(0, 60) : fallback;
}

async function handler(m, { config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const media = cariMedia(m, ["sticker"]);
    if (!media) {
      await m.reply(
        alyaHeader("Info Sticker", "🔍") +
          "\n\n" +
          bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [`◦ Reply sticker lalu ketik *${prefix}stickerinfo*`]) +
          "\n\n" +
          bracketBox("ℹ️", "ᴍᴇɴᴀᴍᴘɪʟᴋᴀɴ", [
            "◦ Nama paket & pembuat",
            "◦ Jumlah frame & durasi",
            "◦ Dimensi dan ukuran berkas",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ubah pemiliknya dengan ${prefix}take`),
      );
      return { handled: true };
    }

    const buffer = await unduhMedia(media);
    const info = await infoWebp(buffer);
    const exif = await bacaExifSticker(buffer);

    const detail = [
      `◦ Jenis: *${info.animasi ? "Sticker gerak" : "Sticker diam"}*`,
      `◦ Dimensi: *${info.lebar} x ${info.tinggi} px*`,
      `◦ Ukuran berkas: *${ukuranTeks(info.ukuran)}*`,
    ];
    if (info.animasi) {
      const durasi = (info.delay || []).reduce((a, b) => a + (b || 100), 0) / 1000;
      detail.push(`◦ Frame: *${info.frame}*`);
      detail.push(`◦ Durasi: *${durasi.toFixed(1)} detik*`);
    }

    const asal = exif
      ? [
          `◦ Paket: *${ringkasNama(exif["sticker-pack-name"])}*`,
          `◦ Pembuat: *${ringkasNama(exif["sticker-pack-publisher"])}*`,
        ]
      : ["◦ Sticker ini *tidak punya metadata*.", "◦ Kemungkinan dibuat tanpa penanda paket."];

    if (exif?.emojis?.length) {
      asal.push(`◦ Emoji: *${exif.emojis.slice(0, 8).join(" ")}*`);
    }
    if (exif?.["android-app-store-link"]) {
      asal.push("◦ Punya tautan toko aplikasi");
    }

    await m.reply(
      alyaHeader("Info Sticker", "🔍") +
        "\n\n" +
        bracketBox("📊", "ᴅᴇᴛᴀɪʟ", detail) +
        "\n\n" +
        bracketBox("🏷️", "ᴀꜱᴀʟ", asal) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(
          info.animasi
            ? `Jadikan video dengan ${prefix}tovideo`
            : `Jadikan gambar dengan ${prefix}toimg`,
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
        tipText(`Ketik ${prefix}stickerinfo untuk panduan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { bacaExifSticker, ringkasNama };
