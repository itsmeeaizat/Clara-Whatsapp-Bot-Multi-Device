/**
 * Artifact — barang langka yang dimiliki
 * ---------------------------------------------------------------
 * Dulu PLACEHOLDER berisi artefak karangan. Kini membaca barang
 * langka yang benar-benar ada di tas pemain.
 *
 *   .artifact
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  cariBarang,
  SENJATA,
  ARMOR,
  angka,
} from "../../src/lib/clara-rpg-core.js";

/** Barang yang dianggap langka beserta tingkat kelangkaannya. */
const KELANGKAAN = {
  excalibur: { tingkat: "Legendaris", ikon: "🌟", warna: "★★★★★" },
  zirah_dewa: { tingkat: "Legendaris", ikon: "🌟", warna: "★★★★★" },
  pedang_naga: { tingkat: "Epik", ikon: "💜", warna: "★★★★" },
  zirah_naga: { tingkat: "Epik", ikon: "💜", warna: "★★★★" },
  sisik_naga: { tingkat: "Epik", ikon: "💜", warna: "★★★★" },
  tongkat_sihir: { tingkat: "Langka", ikon: "💙", warna: "★★★" },
  kristal: { tingkat: "Langka", ikon: "💙", warna: "★★★" },
  pedang_baja: { tingkat: "Bagus", ikon: "💚", warna: "★★" },
  zirah_besi: { tingkat: "Bagus", ikon: "💚", warna: "★★" },
};

const pluginConfig = {
  name: "artifact",
  alias: ["artefak", "relic", "itemlangka", "barangnlangka"],
  category: "game",
  description: "Lihat barang langka dan legendaris yang kamu miliki",
  usage: ".artifact",
  example: ".artifact",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const p = ambilPemain(db, m.sender);
    const inv = p.inventaris || {};

    const punya = [];
    for (const [kode, info] of Object.entries(KELANGKAAN)) {
      const jumlah = inv[kode] || 0;
      const dipakai = p.senjata === kode || p.armor === kode;
      if (jumlah > 0 || dipakai) {
        const barang = cariBarang(kode);
        punya.push({
          kode,
          nama: barang?.nama || kode,
          ikonBarang: barang?.ikon || "📦",
          jumlah: jumlah || (dipakai ? 1 : 0),
          dipakai,
          ...info,
        });
      }
    }

    // Urutkan dari yang paling langka
    const urutan = { Legendaris: 4, Epik: 3, Langka: 2, Bagus: 1 };
    punya.sort((a, b) => (urutan[b.tingkat] || 0) - (urutan[a.tingkat] || 0));

    if (!punya.length) {
      const belum = Object.entries(KELANGKAAN)
        .slice(0, 6)
        .map(([kode, i]) => {
          const b = cariBarang(kode);
          return `◦ ${i.ikon} ${b?.ikon || ""} *${b?.nama || kode}* — ${i.tingkat}`;
        });

      await m.reply(
        alyaHeader("Belum Punya Artefak", "🏺") +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            "◦ Kamu belum memiliki barang langka.",
            "◦ Barang langka didapat dari peti harta,",
            "  raid bos, atau dibeli di toko.",
          ]) +
          "\n\n" +
          bracketBox("✨", "ʏᴀɴɢ ʙɪꜱᴀ ᴅɪᴄᴀʀɪ", belum) +
          "\n\n" +
          bracketBox("🎯", "ᴄᴀʀᴀ ᴍᴇɴᴅᴀᴘᴀᴛ", [
            `◦ *${prefix}tambangrpg dalam* — cari peti`,
            `◦ *${prefix}raidbos* — kalahkan bos`,
            `◦ *${prefix}tokorpg* — beli langsung`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Penyumbang terbesar raid bos dapat Sisik Naga"),
      );
      return { handled: true };
    }

    const baris = punya.map((x) => {
      const status = x.dipakai ? " ✅ dipakai" : "";
      return `◦ ${x.ikon} ${x.ikonBarang} *${x.nama}*${status}\n│     ${x.warna} ${x.tingkat}${x.jumlah > 1 ? ` · ×${x.jumlah}` : ""}`;
    });

    const hitung = punya.reduce((acc, x) => {
      acc[x.tingkat] = (acc[x.tingkat] || 0) + 1;
      return acc;
    }, {});

    await m.reply(
      alyaHeader("Koleksi Artefak", "🏺") +
        "\n\n" +
        bracketBox("✨", "ᴋᴏʟᴇᴋꜱɪᴍᴜ", baris) +
        "\n\n" +
        bracketBox("📊", "ʀɪɴɢᴋᴀꜱᴀɴ", [
          `◦ Total jenis: *${punya.length}*`,
          ...Object.entries(hitung).map(([t, n]) => `◦ ${t}: *${n}*`),
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Pakai dengan ${prefix}tokorpg pakai <barang>`),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}artifact untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { KELANGKAAN };
