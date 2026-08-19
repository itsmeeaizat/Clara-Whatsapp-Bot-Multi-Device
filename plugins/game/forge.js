// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Forge — crafting senjata & armor dari bahan
 * ---------------------------------------------------------------
 *   .forge            lihat daftar resep
 *   .forge craft <id> crafting item
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
  tambahBarang,
  kurangiBarang,
  cariBarang,
  SENJATA,
  ARMOR,
  BAHAN,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "forge",
  alias: ["craft", "crafting", "tambangforge", "tempa"],
  category: "game",
  description: "Forge — crafting senjata & armor dari bahan mentah",
  usage: ".forge [craft <id>]",
  example: ".forge",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const REPES = [
  {
    id: "pedang_besi",
    hasil: "pedang_besi",
    bahan: [{ kode: "batu_asah", jumlah: 3 }],
    koin: 1500,
  },
  {
    id: "pedang_baja",
    hasil: "pedang_baja",
    bahan: [
      { kode: "batu_asah", jumlah: 5 },
      { kode: "kristal", jumlah: 2 },
    ],
    koin: 4000,
  },
  {
    id: "tongkat_sihir",
    hasil: "tongkat_sihir",
    bahan: [{ kode: "kristal", jumlah: 3 }],
    koin: 6000,
  },
  {
    id: "zirah_besi",
    hasil: "zirah_besi",
    bahan: [{ kode: "batu_asah", jumlah: 4 }],
    koin: 3000,
  },
  {
    id: "zirah_naga",
    hasil: "zirah_naga",
    bahan: [
      { kode: "sisik_naga", jumlah: 3 },
      { kode: "kristal", jumlah: 2 },
    ],
    koin: 15000,
  },
  {
    id: "ramuan",
    hasil: "ramuan",
    bahan: [{ kode: "batu_asah", jumlah: 1 }],
    koin: 100,
  },
  {
    id: "pedang_naga",
    hasil: "pedang_naga",
    bahan: [
      { kode: "sisik_naga", jumlah: 5 },
      { kode: "kristal", jumlah: 3 },
    ],
    koin: 30000,
  },
];

function namaBarang(kode) {
  const b = cariBarang(kode);
  return b ? `${b.ikon} ${b.nama}` : kode;
}

async function handler(m, { sock, config }) {
  const prefix = config?.command?.prefix || ".";
  const db = m?.db || sock?.db;
  if (!db) return { handled: true };

  try {
    const p = ambilPemain(db, m.sender);
    if (!p) {
      await m.reply(
        alyaHeader("Forge", "🔨") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum terdaftar. Ketik *.petualang* dulu."])
      );
      return { handled: true };
    }

    const teks = (m.text || "").trim().toLowerCase();
    const parts = teks.split(/\s+/);

    // --- .forge craft <id> ---
    if (parts[0] === "craft" || parts[0] === "buat" || parts[0] === "tempa") {
      const id = parts[1];
      if (!id) {
        await m.reply(
          alyaHeader("Forge", "🔨") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Format: *${prefix}forge craft <id>*`]) +
            "\n\n" +
            tipText(`Lihat resep: ${prefix}forge`)
        );
        return { handled: true };
      }

      const resep = REPES.find((r) => r.id === id);
      if (!resep) {
        await m.reply(
          alyaHeader("Resep Tidak Ada", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Resep *${id}* tidak ditemukan.`])
        );
        return { handled: true };
      }

      // Cek bahan
      const inv = p.inventaris || {};
      const kurangBahan = [];
      for (const b of resep.bahan) {
        const punya = inv[b.kode] || 0;
        if (punya < b.jumlah) {
          kurangBahan.push(`${namaBarang(b.kode)} (${punya}/${b.jumlah})`);
        }
      }

      if (kurangBahan.length > 0) {
        await m.reply(
          alyaHeader("Bahan Kurang", "❌") +
            "\n\n" +
            bracketBox("📦", "ʙᴀʜᴀɴ ᴋᴜʀᴀɴɢ", kurangBahan.map((k) => `◦ ${k}`)) +
            "\n\n" +
            tipText("Dapatkan bahan dari bertarung, tambang, atau mancing")
        );
        return { handled: true };
      }

      // Cek koin
      if (p.koin < resep.koin) {
        await m.reply(
          alyaHeader("Koin Kurang", "❌") +
            "\n\n" +
            bracketBox("💰", "ɪɴꜰᴏ", [
              `◦ Butuh: *${angka(resep.koin)} koin*`,
              `◦ Punya: *${angka(p.koin)} koin*`,
            ])
        );
        return { handled: true };
      }

      // Eksekusi crafting
      for (const b of resep.bahan) {
        kurangiBarang(db, m.sender, b.kode, b.jumlah);
      }
      ambilKoin(db, m.sender, resep.koin);
      tambahBarang(db, m.sender, resep.hasil, 1);

      const hasil = cariBarang(resep.hasil);

      await m.reply(
        alyaHeader("Crafting Berhasil! 🔨", "✨") +
          "\n\n" +
          bracketBox("✅", "ʜᴀꜱɪʟ ᴄʀᴀꜰᴛ", [
            `◦ Item: ${hasil?.ikon || ""} *${hasil?.nama || resep.hasil}*`,
            `◦ Biaya: *${angka(resep.koin)} koin*`,
          ]) +
          "\n\n" +
          bracketBox("📦", "ʙᴀʜᴀɴ ᴅɪᴘᴀᴋᴀɪ", resep.bahan.map((b) => `◦ ${namaBarang(b.kode)} x${b.jumlah}`)) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Cek tas: ${prefix}tas`)
      );
      return { handled: true };
    }

    // --- .forge (lihat resep) ---
    const lines = [];
    for (const r of REPES) {
      const hasil = cariBarang(r.hasil);
      const bahanStr = r.bahan
        .map((b) => `${namaBarang(b.kode)} x${b.jumlah}`)
        .join(" + ");
      const punya = (p.inventaris || {})[r.hasil] || 0;

      lines.push(`${hasil?.ikon || ""} *${r.id}*`);
      lines.push(`   Hasil: ${hasil?.nama || r.hasil}${punya > 0 ? ` (punya: ${punya})` : ""}`);
      lines.push(`   Bahan: ${bahanStr}`);
      lines.push(`   Biaya: 💰 ${angka(r.koin)} koin`);
      lines.push(`   Craft: *${prefix}forge craft ${r.id}*`);
      lines.push("");
    }

    await m.reply(
      alyaHeader("Forge", "🔨") +
        "\n\n" +
        bracketBox("💰", "ꜱᴀʟᴅᴏ", [`◦ Koin: *${angka(p.koin)}*`]) +
        "\n\n" +
        bracketBox("📜", "ᴅᴀꜰᴛᴀʀ ʀᴇꜱᴇᴘ", lines) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Craft: ${prefix}forge craft <id>`)
    );
  } catch (err) {
    await m.reply(
      alyaHeader("Error", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ ${String(err.message).slice(0, 100)}`])
    );
  }

  return { handled: true };
}

export { pluginConfig, handler };
