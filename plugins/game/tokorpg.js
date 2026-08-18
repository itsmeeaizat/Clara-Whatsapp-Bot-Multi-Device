/**
 * Toko RPG — beli senjata, armor, dan bahan
 * ---------------------------------------------------------------
 * Koin yang dipakai adalah koin yang sama dengan .balance, jadi
 * hasil bertarung benar-benar bisa dibelanjakan.
 *
 *   .tokorpg                daftar barang
 *   .tokorpg beli pedang_besi
 *   .tokorpg pakai pedang_besi
 *   .tokorpg jual kristal 2
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  simpanPemain,
  ambilKoin,
  beriHadiah,
  progresQuest,
  tambahBarang,
  kurangiBarang,
  cariBarang,
  SENJATA,
  ARMOR,
  BAHAN,
  kekuatanSerang,
  kekuatanBela,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "tokorpg",
  alias: ["shoprpg", "tokopetualang", "belirpg"],
  category: "game",
  description: "Toko RPG: beli senjata, armor, dan bahan dengan koin",
  usage: ".tokorpg [beli|pakai|jual] <barang>",
  example: ".tokorpg beli pedang_besi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function daftarToko(prefix, p) {
  const senjata = Object.entries(SENJATA).map(
    ([k, v]) =>
      `◦ ${v.ikon} *${k}*\n│     +${v.serang} serang · ${angka(v.harga)} koin`,
  );
  const armor = Object.entries(ARMOR).map(
    ([k, v]) => `◦ ${v.ikon} *${k}*\n│     +${v.bela} bela · ${angka(v.harga)} koin`,
  );
  const bahan = Object.entries(BAHAN)
    .filter(([, v]) => v.harga > 0)
    .map(([k, v]) => `◦ ${v.ikon} *${k}* — ${angka(v.harga)} koin`);

  return (
    alyaHeader("Toko Petualang", "🏪") +
    "\n\n" +
    bracketBox("💰", "ᴋᴏɪɴᴍᴜ", [`◦ *${angka(p.koin)} koin*`]) +
    "\n\n" +
    bracketBox("⚔️", "ꜱᴇɴᴊᴀᴛᴀ", senjata) +
    "\n\n" +
    bracketBox("🛡️", "ᴀʀᴍᴏʀ", armor) +
    "\n\n" +
    bracketBox("🧪", "ʙᴀʜᴀɴ", bahan) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}tokorpg beli <barang>*`,
      `◦ *${prefix}tokorpg pakai <barang>*`,
      `◦ *${prefix}tokorpg jual <barang> [jumlah]*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Senjata dan armor harus dipakai dulu agar berefek")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const kode = (args[1] || "").toLowerCase().replace(/\s+/g, "_");
    const p = ambilPemain(db, m.sender);

    /* --- daftar --- */
    if (!sub || ["daftar", "list"].includes(sub)) {
      await m.reply(daftarToko(prefix, p));
      return { handled: true };
    }

    /* --- beli --- */
    if (["beli", "buy"].includes(sub)) {
      const barang = cariBarang(kode);
      if (!barang || !barang.harga) {
        await m.reply(
          alyaHeader("Barang Tidak Ada", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ *${kode.slice(0, 25) || "(kosong)"}* tidak dijual.`,
              `◦ Lihat daftar: *${prefix}tokorpg*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Tulis kode barang persis seperti di daftar"),
        );
        return { handled: true };
      }

      if (p.koin < barang.harga) {
        await m.reply(
          alyaHeader("Koin Kurang", "💸") +
            "\n\n" +
            bracketBox("💸", "ɪɴꜰᴏ", [
              `◦ Harga: *${angka(barang.harga)}*`,
              `◦ Koinmu: *${angka(p.koin)}*`,
              `◦ Kurang: *${angka(barang.harga - p.koin)}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Cari koin dengan ${prefix}tambangrpg atau ${prefix}bertarung`),
        );
        return { handled: true };
      }

      if (!ambilKoin(db, m.sender, barang.harga)) {
        await m.reply(
          alyaHeader("Gagal Membayar", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Pembayaran gagal, koin tidak berkurang."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Coba lagi sebentar"),
        );
        return { handled: true };
      }

      tambahBarang(db, m.sender, barang.kode, 1);
      const sesudah = ambilPemain(db, m.sender);
      if (sesudah.questHarian) progresQuest(sesudah, "belanja_1k", barang.harga);

      await m.reply(
        alyaHeader("Pembelian Berhasil", "🛍️") +
          "\n\n" +
          bracketBox("✅", "ᴅɪʙᴇʟɪ", [
            `◦ ${barang.ikon} *${barang.nama}*`,
            `◦ Harga: *${angka(barang.harga)} koin*`,
            `◦ Sisa koin: *${angka(sesudah.koin)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(
            barang.jenis === "bahan"
              ? `Pakai ramuan dengan ${prefix}ramuan`
              : `Pakai dengan ${prefix}tokorpg pakai ${barang.kode}`,
          ),
      );
      return { handled: true };
    }

    /* --- pakai --- */
    if (["pakai", "equip", "gunakan"].includes(sub)) {
      const barang = cariBarang(kode);
      if (!barang || barang.jenis === "bahan") {
        await m.reply(
          alyaHeader("Tidak Bisa Dipakai", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              "◦ Hanya senjata dan armor yang bisa dipakai.",
              `◦ Contoh: *${prefix}tokorpg pakai pedang_besi*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Ramuan dipakai lewat ${prefix}ramuan`),
        );
        return { handled: true };
      }

      if (!(p.inventaris || {})[barang.kode]) {
        await m.reply(
          alyaHeader("Belum Punya", "🎒") +
            "\n\n" +
            bracketBox("🎒", "ɪɴꜰᴏ", [
              `◦ Kamu belum punya *${barang.nama}*.`,
              `◦ Beli dulu: *${prefix}tokorpg beli ${barang.kode}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Lihat isi tas dengan ${prefix}tasrpg`),
        );
        return { handled: true };
      }

      const sebelumSerang = kekuatanSerang(p);
      const sebelumBela = kekuatanBela(p);

      simpanPemain(
        db,
        m.sender,
        barang.jenis === "senjata" ? { senjata: barang.kode } : { armor: barang.kode },
      );

      const sesudah = ambilPemain(db, m.sender);

      await m.reply(
        alyaHeader("Perlengkapan Dipakai", "✨") +
          "\n\n" +
          bracketBox("🎽", "ᴅɪᴘᴀᴋᴀɪ", [
            `◦ ${barang.ikon} *${barang.nama}*`,
            `◦ Jenis: *${barang.jenis}*`,
          ]) +
          "\n\n" +
          bracketBox("📊", "ᴘᴇʀᴜʙᴀʜᴀɴ", [
            `◦ Serangan: *${angka(sebelumSerang)}* → *${angka(kekuatanSerang(sesudah))}*`,
            `◦ Pertahanan: *${angka(sebelumBela)}* → *${angka(kekuatanBela(sesudah))}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Coba kekuatan baru dengan ${prefix}bertarung`),
      );
      return { handled: true };
    }

    /* --- jual --- */
    if (["jual", "sell"].includes(sub)) {
      const barang = cariBarang(kode);
      const jumlah = Math.max(1, parseInt(args[2], 10) || 1);

      if (!barang) {
        await m.reply(
          alyaHeader("Barang Tidak Dikenal", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ *${kode.slice(0, 25) || "(kosong)"}* tidak dikenal.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Lihat isi tas dengan ${prefix}tasrpg`),
        );
        return { handled: true };
      }

      const punya = (p.inventaris || {})[barang.kode] || 0;
      if (punya < jumlah) {
        await m.reply(
          alyaHeader("Barang Kurang", "🎒") +
            "\n\n" +
            bracketBox("🎒", "ɪɴꜰᴏ", [
              `◦ Punya: *${punya}*`,
              `◦ Ingin dijual: *${jumlah}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Lihat isi tas dengan ${prefix}tasrpg`),
        );
        return { handled: true };
      }

      // Barang yang sedang dipakai tidak boleh dijual
      if (p.senjata === barang.kode || p.armor === barang.kode) {
        await m.reply(
          alyaHeader("Sedang Dipakai", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ *${barang.nama}* sedang kamu pakai.`,
              "◦ Lepas dulu dengan memakai barang lain.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Perlengkapan aktif tidak bisa dijual"),
        );
        return { handled: true };
      }

      const hargaJual = barang.jual || Math.floor((barang.harga || 0) * 0.4);
      if (!hargaJual) {
        await m.reply(
          alyaHeader("Tidak Laku", "🤷") +
            "\n\n" +
            bracketBox("🤷", "ɪɴꜰᴏ", [`◦ *${barang.nama}* tidak bisa dijual.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Simpan saja untuk keperluan lain"),
        );
        return { handled: true };
      }

      if (!kurangiBarang(db, m.sender, barang.kode, jumlah)) {
        await m.reply(
          alyaHeader("Gagal", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Barang gagal dikeluarkan dari tas."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Coba lagi sebentar"),
        );
        return { handled: true };
      }

      const total = hargaJual * jumlah;
      beriHadiah(db, m.sender, total, 0);
      const sesudah = ambilPemain(db, m.sender);

      await m.reply(
        alyaHeader("Penjualan Berhasil", "💰") +
          "\n\n" +
          bracketBox("✅", "ᴛᴇʀᴊᴜᴀʟ", [
            `◦ ${barang.ikon} *${barang.nama}* × ${jumlah}`,
            `◦ Harga satuan: *${angka(hargaJual)}*`,
            `◦ Diterima: *+${angka(total)} koin*`,
            `◦ Total koin: *${angka(sesudah.koin)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Belanja lagi dengan ${prefix}tokorpg`),
      );
      return { handled: true };
    }

    await m.reply(daftarToko(prefix, p));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}tokorpg untuk daftar barang`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { daftarToko };
