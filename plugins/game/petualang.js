// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Petualang — kartu karakter RPG
 * ---------------------------------------------------------------
 * Titik masuk seluruh sistem RPG: membuat karakter, memilih kelas,
 * dan melihat statistik lengkap.
 *
 *   .petualang              lihat kartu karakter
 *   .petualang kelas        daftar kelas
 *   .petualang kelas pemanah
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
  KELAS,
  SENJATA,
  ARMOR,
  levelDariExp,
  expUntukLevel,
  progresLevel,
  kekuatanSerang,
  kekuatanBela,
  peluangKritis,
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  MAKS_LEVEL,
  bar,
  angka,
  labelKelas,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "petualang",
  alias: ["charrpg", "kartuku", "myrpg", "statku"],
  category: "game",
  description: "Kartu karakter RPG: level, kelas, kekuatan, dan perlengkapan",
  usage: ".petualang [kelas <nama>]",
  example: ".petualang kelas pemanah",
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
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();

    /* --- ganti / lihat kelas --- */
    if (["kelas", "class", "job"].includes(sub)) {
      const pilihan = (args[1] || "").toLowerCase();

      if (!pilihan) {
        const baris = Object.entries(KELAS).map(
          ([kode, k]) =>
            `◦ ${k.ikon} *${kode}* — ${k.ket}\n│     HP ×${k.hp} · Serang ×${k.serang} · Kritis ${Math.round(k.kritis * 100)}%`,
        );
        await m.reply(
          alyaHeader("Pilih Kelas", "🎭") +
            "\n\n" +
            bracketBox("🎭", "ᴋᴇʟᴀꜱ ᴛᴇʀꜱᴇᴅɪᴀ", baris) +
            "\n\n" +
            bracketBox("💡", "ᴄᴀʀᴀ ɢᴀɴᴛɪ", [
              `◦ *${prefix}petualang kelas pemanah*`,
              "◦ Gratis, bisa diganti kapan saja.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Kelas mengubah HP, serangan, dan peluang kritis"),
        );
        return { handled: true };
      }

      if (!KELAS[pilihan]) {
        await m.reply(
          alyaHeader("Kelas Tidak Ada", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ *${pilihan.slice(0, 20)}* bukan kelas yang tersedia.`,
              `◦ Pilihan: *${Object.keys(KELAS).join(" · ")}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}petualang kelas untuk daftar lengkap`),
        );
        return { handled: true };
      }

      simpanPemain(db, m.sender, { kelas: pilihan });
      const p = ambilPemain(db, m.sender);
      await m.reply(
        alyaHeader("Kelas Diganti", "✨") +
          "\n\n" +
          bracketBox("🎭", "ᴋᴇʟᴀꜱ ʙᴀʀᴜ", [
            `◦ ${labelKelas(pilihan)}`,
            `◦ ${KELAS[pilihan].ket}`,
          ]) +
          "\n\n" +
          bracketBox("📊", "ꜱᴛᴀᴛᴜꜱ ʙᴀʀᴜ", [
            `◦ HP maksimal: *${angka(p.hpMaks)}*`,
            `◦ Serangan: *${angka(kekuatanSerang(p))}*`,
            `◦ Pertahanan: *${angka(kekuatanBela(p))}*`,
            `◦ Peluang kritis: *${Math.round(peluangKritis(p) * 100)}%*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}bertarung untuk mencoba kekuatan baru`),
      );
      return { handled: true };
    }

    /* --- kartu karakter --- */
    const p = ambilPemain(db, m.sender);
    const persen = progresLevel(p.exp);
    const berikut = p.level >= MAKS_LEVEL ? null : expUntukLevel(p.level + 1);
    const sisaExp = berikut ? berikut - p.exp : 0;

    const senjata = SENJATA[p.senjata];
    const armor = ARMOR[p.armor];
    const jumlahBarang = Object.values(p.inventaris || {}).reduce((a, b) => a + b, 0);
    const st = p.statistik || {};
    const totalTanding = (st.menang || 0) + (st.kalah || 0);
    const rasio = totalTanding ? Math.round(((st.menang || 0) / totalTanding) * 100) : 0;

    await m.reply(
      alyaHeader("Kartu Petualang", "🗺️") +
        "\n\n" +
        bracketBox("🎭", "ɪᴅᴇɴᴛɪᴛᴀꜱ", [
          `◦ Nama: *${String(p.nama).slice(0, 25)}*`,
          `◦ Kelas: *${labelKelas(p.kelas)}*`,
          `◦ Level: *${p.level}* / ${MAKS_LEVEL}`,
        ]) +
        "\n\n" +
        bracketBox("📈", "ᴋᴇᴍᴀᴊᴜᴀɴ", [
          `◦ ${bar(persen, 100)} *${persen.toFixed(1)}%*`,
          `◦ Exp: *${angka(p.exp)}*`,
          berikut
            ? `◦ Menuju level ${p.level + 1}: *${angka(sisaExp)} exp lagi*`
            : "◦ *Level maksimal tercapai!*",
        ]) +
        "\n\n" +
        bracketBox("⚔️", "ᴋᴇᴋᴜᴀᴛᴀɴ", [
          `◦ HP: ${bar(p.hp, p.hpMaks, 8)} *${angka(p.hp)}/${angka(p.hpMaks)}*`,
          `◦ Serangan: *${angka(kekuatanSerang(p))}*`,
          `◦ Pertahanan: *${angka(kekuatanBela(p))}*`,
          `◦ Kritis: *${Math.round(peluangKritis(p) * 100)}%*`,
        ]) +
        "\n\n" +
        bracketBox("🎒", "ᴘᴇʀʟᴇɴɢᴋᴀᴘᴀɴ", [
          `◦ Senjata: *${senjata ? `${senjata.ikon} ${senjata.nama}` : "tangan kosong"}*`,
          `◦ Armor: *${armor ? `${armor.ikon} ${armor.nama}` : "tanpa pelindung"}*`,
          `◦ Barang: *${jumlahBarang} item*`,
        ]) +
        "\n\n" +
        bracketBox("💰", "ꜱᴜᴍʙᴇʀ ᴅᴀʏᴀ", [
          `◦ Koin: *${angka(p.koin)}*`,
          `◦ Stamina: *${p.stamina}/${STAMINA_MAKS}*` +
            (p.stamina < STAMINA_MAKS ? ` (+1 dalam ${menitStaminaBerikutnya(p)} menit)` : ""),
        ]) +
        "\n\n" +
        bracketBox("🏆", "ʀᴇᴋᴀᴍ ᴊᴇᴊᴀᴋ", [
          `◦ Monster dikalahkan: *${angka(st.monster || 0)}*`,
          `◦ Bos dikalahkan: *${angka(st.bosDikalahkan || 0)}*`,
          `◦ Duel: *${st.menang || 0}M / ${st.kalah || 0}K* (${rasio}%)`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`${prefix}rpgmenu untuk semua perintah RPG`),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}petualang untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
