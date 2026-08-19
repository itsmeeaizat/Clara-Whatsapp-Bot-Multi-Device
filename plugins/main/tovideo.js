// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Sticker -> Video / GIF
 * ---------------------------------------------------------------
 * Kebalikan dari .sticker. Sticker gerak diubah menjadi MP4 atau
 * GIF sehingga bisa disimpan dan dibagikan di luar WhatsApp.
 *
 *   .tovideo    (reply sticker gerak)
 *   .togif      (reply sticker gerak)
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
  webpKeMp4,
  webpKeGif,
  webpKePng,
  ukuranTeks,
} from "../../src/lib/clara-media-util.js";

const pluginConfig = {
  name: "tovideo",
  alias: ["togif", "tomp4", "stickertovideo", "sticker2video"],
  category: "sticker",
  description: "Ubah sticker gerak menjadi video MP4 atau GIF",
  usage: "Reply sticker dengan .tovideo atau .togif",
  example: ".tovideo (reply sticker gerak)",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function panduan(prefix) {
  return (
    alyaHeader("Sticker ke Video", "🎬") +
    "\n\n" +
    bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
      `◦ Reply sticker lalu ketik *${prefix}tovideo*`,
      `◦ Ingin GIF? pakai *${prefix}togif*`,
    ]) +
    "\n\n" +
    bracketBox("ℹ️", "ᴄᴀᴛᴀᴛᴀɴ", [
      "◦ Sticker *gerak* jadi video atau GIF.",
      "◦ Sticker *diam* otomatis dikirim sebagai gambar.",
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Kebalikannya: ${prefix}sticker untuk membuat sticker`)
  );
}

async function handler(m, { sock, config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";
  const perintah = (m.command || "").toLowerCase();
  const mauGif = ["togif"].includes(perintah);

  try {
    const media = cariMedia(m, ["sticker"]);
    if (!media) {
      await m.reply(panduan(prefix));
      return { handled: true };
    }

    await m.reply(
      alyaHeader("Memproses", "⏳") +
        "\n\n" +
        bracketBox("⚙️", "ᴘʀᴏꜱᴇꜱ", [
          `◦ Mengubah sticker jadi *${mauGif ? "GIF" : "video"}*...`,
          "◦ Mohon tunggu sebentar.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Sticker panjang butuh waktu lebih lama"),
    );

    const buffer = await unduhMedia(media);
    const info = await infoWebp(buffer);

    /* Sticker diam tidak ada yang bisa dianimasikan -> kirim gambar. */
    if (!info.animasi) {
      const png = await webpKePng(buffer);
      await sock.sendMessage(
        m.chat,
        {
          image: png,
          caption:
            alyaHeader("Sticker Diam", "🖼️") +
            "\n\n" +
            bracketBox("ℹ️", "ɪɴꜰᴏ", [
              "◦ Sticker ini *tidak bergerak*,",
              "  jadi dikirim sebagai gambar.",
              `◦ Ukuran: *${info.lebar}x${info.tinggi}*`,
              `◦ Berkas: *${ukuranTeks(png.length)}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Gunakan ${prefix}toimg untuk hasil yang sama`),
        },
        { quoted: m },
      );
      return { handled: true };
    }

    /* Sticker gerak */
    const durasi = (info.delay || []).reduce((a, b) => a + (b || 100), 0) / 1000;

    if (mauGif) {
      const gif = await webpKeGif(buffer);
      // GIF dikirim sebagai dokumen supaya tidak dipaksa jadi sticker
      await sock.sendMessage(
        m.chat,
        {
          document: gif,
          mimetype: "image/gif",
          fileName: `clara_${Date.now()}.gif`,
          caption:
            alyaHeader("GIF Siap", "🎞️") +
            "\n\n" +
            bracketBox("📊", "ᴅᴇᴛᴀɪʟ", [
              `◦ Frame: *${info.frame}*`,
              `◦ Durasi: *${durasi.toFixed(1)} detik*`,
              `◦ Ukuran: *${info.lebar}x${info.tinggi}*`,
              `◦ Berkas: *${ukuranTeks(gif.length)}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Dikirim sebagai dokumen agar kualitas GIF utuh"),
        },
        { quoted: m },
      );
      return { handled: true };
    }

    const mp4 = await webpKeMp4(buffer);
    await sock.sendMessage(
      m.chat,
      {
        video: mp4,
        mimetype: "video/mp4",
        gifPlayback: true,
        caption:
          alyaHeader("Video Siap", "🎬") +
          "\n\n" +
          bracketBox("📊", "ᴅᴇᴛᴀɪʟ", [
            `◦ Frame: *${info.frame}*`,
            `◦ Durasi: *${durasi.toFixed(1)} detik*`,
            `◦ Ukuran: *${info.lebar}x${info.tinggi}*`,
            `◦ Berkas: *${ukuranTeks(mp4.length)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ingin GIF? pakai ${prefix}togif`),
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
          "◦ Pastikan yang di-reply memang sticker.",
          "◦ Sticker sangat panjang bisa gagal diproses.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}tovideo untuk panduan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { panduan };
