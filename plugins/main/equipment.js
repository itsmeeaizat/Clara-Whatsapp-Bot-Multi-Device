// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Equipment — perlengkapan yang sedang dipakai
 * ---------------------------------------------------------------
 * Dulu PLACEHOLDER berisi "Iron Sword" dan "Leather Armor" karangan.
 * Kini membaca perlengkapan asli pemain dari clara-rpg-core.
 *
 *   .equipment
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  SENJATA,
  ARMOR,
  kekuatanSerang,
  kekuatanBela,
  peluangKritis,
  angka,
  labelKelas,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "equipment",
  alias: ["gear", "peralatan", "perlengkapan"],
  category: "game",
  description: "Lihat senjata dan armor yang sedang dipakai beserta efeknya",
  usage: ".equipment",
  example: ".equipment",
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
    const senjata = SENJATA[p.senjata];
    const armor = ARMOR[p.armor];
    const inv = p.inventaris || {};

    const dipakai = [
      senjata
        ? `◦ ⚔️ Senjata: *${senjata.ikon} ${senjata.nama}*\n│     +${senjata.serang} serang${senjata.kritis ? ` · +${Math.round(senjata.kritis * 100)}% kritis` : ""}`
        : "◦ ⚔️ Senjata: *tangan kosong*",
      armor
        ? `◦ 🛡️ Armor: *${armor.ikon} ${armor.nama}*\n│     +${armor.bela} pertahanan`
        : "◦ 🛡️ Armor: *tanpa pelindung*",
    ];

    // Perlengkapan yang dimiliki tetapi belum dipakai
    const cadangan = [];
    for (const [kode, jumlah] of Object.entries(inv)) {
      if (jumlah <= 0) continue;
      if (SENJATA[kode] && kode !== p.senjata) {
        cadangan.push(`◦ ${SENJATA[kode].ikon} *${kode}* — +${SENJATA[kode].serang} serang`);
      } else if (ARMOR[kode] && kode !== p.armor) {
        cadangan.push(`◦ ${ARMOR[kode].ikon} *${kode}* — +${ARMOR[kode].bela} bela`);
      }
    }

    const bagian = [
      alyaHeader("Perlengkapan", "🎽"),
      "\n\n",
      bracketBox("👤", "ᴘᴇᴍᴀᴋᴀɪ", [
        `◦ ${labelKelas(p.kelas)} · Level *${p.level}*`,
      ]),
      "\n\n",
      bracketBox("🎽", "ᴅɪᴘᴀᴋᴀɪ", dipakai),
      "\n\n",
      bracketBox("📊", "ᴛᴏᴛᴀʟ ᴋᴇᴋᴜᴀᴛᴀɴ", [
        `◦ Serangan: *${angka(kekuatanSerang(p))}*`,
        `◦ Pertahanan: *${angka(kekuatanBela(p))}*`,
        `◦ Peluang kritis: *${Math.round(peluangKritis(p) * 100)}%*`,
        `◦ HP maksimal: *${angka(p.hpMaks)}*`,
      ]),
    ];

    if (cadangan.length) {
      bagian.push("\n\n", bracketBox("🎒", "ʙᴇʟᴜᴍ ᴅɪᴘᴀᴋᴀɪ", cadangan.slice(0, 8)));
    }

    bagian.push(
      "\n\n",
      separator(),
      "\n",
      tipText(
        cadangan.length
          ? `Pakai dengan ${prefix}tokorpg pakai <barang>`
          : `Beli perlengkapan di ${prefix}tokorpg`,
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
        tipText(`Ketik ${prefix}equipment untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
