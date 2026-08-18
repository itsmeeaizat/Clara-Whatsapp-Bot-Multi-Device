/**
 * Tas — inventaris pemain
 * ---------------------------------------------------------------
 * Melihat isi tas dan membuka peti harta.
 *
 *   .tas          lihat isi tas
 *   .tas buka     buka satu peti harta
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  kurangiBarang,
  tambahBarang,
  beriHadiah,
  cariBarang,
  SENJATA,
  ARMOR,
  angka,
} from "../../src/lib/clara-rpg-core.js";

/** Isi peti harta, `bobot` menentukan kelangkaan. */
const ISI_PETI = [
  { jenis: "koin", min: 200, maks: 1200, bobot: 35 },
  { jenis: "koin", min: 1500, maks: 5000, bobot: 15 },
  { jenis: "barang", kode: "ramuan", jumlah: 3, bobot: 20 },
  { jenis: "barang", kode: "batu_asah", jumlah: 2, bobot: 12 },
  { jenis: "barang", kode: "kristal", jumlah: 1, bobot: 10 },
  { jenis: "barang", kode: "sisik_naga", jumlah: 1, bobot: 5 },
  { jenis: "senjata", kode: "pedang_baja", bobot: 2 },
  { jenis: "armor", kode: "zirah_besi", bobot: 1 },
];

function undiPeti(acakFn = Math.random) {
  const total = ISI_PETI.reduce((a, b) => a + b.bobot, 0);
  let n = acakFn() * total;
  for (const item of ISI_PETI) {
    n -= item.bobot;
    if (n <= 0) return item;
  }
  return ISI_PETI[0];
}

const pluginConfig = {
  name: "tasrpg",
  alias: ["ransel", "kantong", "ranselku", "barangku"],
  category: "game",
  description: "Lihat isi tas dan buka peti harta",
  usage: ".tasrpg [buka]",
  example: ".tasrpg buka",
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
    const sub = (m.text || "").trim().toLowerCase();
    const p = ambilPemain(db, m.sender);
    const inv = p.inventaris || {};

    /* --- buka peti --- */
    if (["buka", "open", "peti"].includes(sub)) {
      const petiPunya = inv.peti_harta || 0;
      if (petiPunya <= 0) {
        await m.reply(
          alyaHeader("Tidak Ada Peti", "🎁") +
            "\n\n" +
            bracketBox("🎁", "ɪɴꜰᴏ", [
              "◦ Kamu belum punya peti harta.",
              `◦ Dapatkan dari *${prefix}tambangrpg* atau *${prefix}mancing*.`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Menggali dalam lebih sering menemukan peti"),
        );
        return { handled: true };
      }

      if (!kurangiBarang(db, m.sender, "peti_harta", 1)) {
        await m.reply(
          alyaHeader("Gagal", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Peti gagal dibuka."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Coba lagi sebentar"),
        );
        return { handled: true };
      }

      const isi = undiPeti();
      const baris = [];
      let judulHadiah = "";

      if (isi.jenis === "koin") {
        const jumlah =
          isi.min + Math.floor(Math.random() * (isi.maks - isi.min + 1));
        beriHadiah(db, m.sender, jumlah, 20);
        judulHadiah = `${angka(jumlah)} koin`;
        baris.push(`◦ 💰 *${angka(jumlah)} koin*`);
      } else {
        const kode = isi.kode;
        const jumlah = isi.jumlah || 1;
        tambahBarang(db, m.sender, kode, jumlah);
        const info = cariBarang(kode);
        judulHadiah = info ? info.nama : kode;
        baris.push(
          `◦ ${info?.ikon || "📦"} *${info?.nama || kode}* × ${jumlah}`,
        );
        if (isi.jenis === "senjata" || isi.jenis === "armor") {
          baris.push(`◦ Pakai: *${prefix}tokorpg pakai ${kode}*`);
        }
      }

      const sesudah = ambilPemain(db, m.sender);

      await m.reply(
        alyaHeader("Peti Dibuka!", "🎁") +
          "\n\n" +
          bracketBox("✨", "ɪꜱɪ ᴘᴇᴛɪ", baris) +
          "\n\n" +
          bracketBox("📦", "ꜱɪꜱᴀ", [
            `◦ Peti tersisa: *${(sesudah.inventaris || {}).peti_harta || 0}*`,
            `◦ Total koin: *${angka(sesudah.koin)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(
            isi.jenis === "senjata" || isi.jenis === "armor"
              ? "Peti langka! Beruntung sekali"
              : `Kumpulkan peti lagi dari ${prefix}tambangrpg`,
          ),
      );
      return { handled: true };
    }

    /* --- lihat isi tas --- */
    const entri = Object.entries(inv).filter(([, n]) => n > 0);

    if (!entri.length) {
      await m.reply(
        alyaHeader("Tas Kosong", "🎒") +
          "\n\n" +
          bracketBox("🎒", "ɪɴꜰᴏ", [
            "◦ Belum ada barang sama sekali.",
            `◦ Cari barang lewat *${prefix}tambangrpg*, *${prefix}mancing*,`,
            `  atau beli di *${prefix}tokorpg*.`,
          ]) +
          "\n\n" +
          bracketBox("💰", "ᴋᴏɪɴ", [`◦ *${angka(p.koin)} koin*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Mulai dari .tambang untuk mengumpulkan koin"),
      );
      return { handled: true };
    }

    const senjata = [];
    const armor = [];
    const bahan = [];

    for (const [kode, jumlah] of entri) {
      const info = cariBarang(kode);
      const dipakai =
        p.senjata === kode || p.armor === kode ? " ✅ dipakai" : "";
      const teks = `◦ ${info?.ikon || "📦"} *${info?.nama || kode}* × ${jumlah}${dipakai}`;
      if (SENJATA[kode]) senjata.push(teks);
      else if (ARMOR[kode]) armor.push(teks);
      else bahan.push(teks);
    }

    const bagian = [alyaHeader("Isi Tas", "🎒"), "\n\n"];

    if (senjata.length) bagian.push(bracketBox("⚔️", "ꜱᴇɴᴊᴀᴛᴀ", senjata), "\n\n");
    if (armor.length) bagian.push(bracketBox("🛡️", "ᴀʀᴍᴏʀ", armor), "\n\n");
    if (bahan.length) bagian.push(bracketBox("🧪", "ʙᴀʜᴀɴ", bahan), "\n\n");

    const totalBarang = entri.reduce((a, [, n]) => a + n, 0);
    bagian.push(
      bracketBox("📊", "ʀɪɴɢᴋᴀꜱᴀɴ", [
        `◦ Jenis barang: *${entri.length}*`,
        `◦ Total item: *${totalBarang}*`,
        `◦ Koin: *${angka(p.koin)}*`,
      ]),
      "\n\n",
      separator(),
      "\n",
      tipText(
        (inv.peti_harta || 0) > 0
          ? `Kamu punya peti! Buka dengan ${prefix}tasrpg buka`
          : `Jual barang dengan ${prefix}tokorpg jual <barang>`,
      ),
    );

    await m.reply(bagian.join(""));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}tasrpg untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { ISI_PETI, undiPeti };
