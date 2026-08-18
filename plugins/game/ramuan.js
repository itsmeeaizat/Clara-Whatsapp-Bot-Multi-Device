/**
 * Ramuan — memulihkan HP
 * ---------------------------------------------------------------
 * Tanpa ini pemain akan macet selamanya begitu HP habis. Ramuan
 * memulihkan 40% HP maksimal, dan tersedia istirahat gratis
 * berbatas waktu bagi yang kehabisan koin.
 *
 *   .ramuan             minum satu ramuan
 *   .ramuan istirahat   pulih perlahan, gratis, sekali per jam
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
  kurangiBarang,
  bar,
  angka,
  BAHAN,
} from "../../src/lib/clara-rpg-core.js";

const PULIH_PERSEN = 0.4;
const JEDA_ISTIRAHAT = 60 * 60 * 1000; // sekali per jam
const ISTIRAHAT_PERSEN = 0.25;

const pluginConfig = {
  name: "ramuan",
  alias: ["minum", "obat", "pulih", "sembuh"],
  category: "game",
  description: "Minum ramuan atau istirahat untuk memulihkan HP",
  usage: ".ramuan [istirahat]",
  example: ".ramuan",
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

    if (p.hp >= p.hpMaks) {
      await m.reply(
        alyaHeader("Sudah Sehat", "💚") +
          "\n\n" +
          bracketBox("💚", "ᴋᴏɴᴅɪꜱɪ", [
            `◦ HP: ${bar(p.hp, p.hpMaks, 10)}`,
            `◦ *${angka(p.hp)}/${angka(p.hpMaks)}* — penuh`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Langsung saja ${prefix}bertarung`),
      );
      return { handled: true };
    }

    /* --- istirahat gratis --- */
    if (["istirahat", "rest", "tidur"].includes(sub)) {
      const terakhir = p.istirahatAt || 0;
      const lewat = Date.now() - terakhir;

      if (lewat < JEDA_ISTIRAHAT) {
        const sisaMenit = Math.ceil((JEDA_ISTIRAHAT - lewat) / 60000);
        await m.reply(
          alyaHeader("Belum Bisa Istirahat", "⏳") +
            "\n\n" +
            bracketBox("⏳", "ᴊᴇᴅᴀ", [
              `◦ Istirahat gratis sekali per *1 jam*.`,
              `◦ Tunggu *${sisaMenit} menit* lagi.`,
            ]) +
            "\n\n" +
            bracketBox("💡", "ᴀʟᴛᴇʀɴᴀᴛɪꜰ", [
              `◦ Minum ramuan: *${prefix}ramuan*`,
              `◦ Beli ramuan: *${prefix}tokorpg beli ramuan*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Ramuan jauh lebih cepat daripada istirahat"),
        );
        return { handled: true };
      }

      const pulih = Math.floor(p.hpMaks * ISTIRAHAT_PERSEN);
      const hpBaru = Math.min(p.hpMaks, p.hp + pulih);
      simpanPemain(db, m.sender, { hp: hpBaru, istirahatAt: Date.now() });

      await m.reply(
        alyaHeader("Istirahat", "😴") +
          "\n\n" +
          bracketBox("😴", "ᴘᴜʟɪʜ", [
            "◦ Kamu beristirahat sejenak di penginapan.",
            `◦ HP pulih: *+${angka(hpBaru - p.hp)}*`,
          ]) +
          "\n\n" +
          bracketBox("❤️", "ᴋᴏɴᴅɪꜱɪ", [
            `◦ ${bar(hpBaru, p.hpMaks, 10)}`,
            `◦ *${angka(hpBaru)}/${angka(p.hpMaks)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Istirahat gratis bisa dipakai lagi 1 jam lagi"),
      );
      return { handled: true };
    }

    /* --- minum ramuan --- */
    const punya = (p.inventaris || {}).ramuan || 0;

    if (punya <= 0) {
      await m.reply(
        alyaHeader("Ramuan Habis", "🧪") +
          "\n\n" +
          bracketBox("🎒", "ɪɴꜰᴏ", [
            "◦ Kamu tidak punya ramuan.",
            `◦ Harga: *${angka(BAHAN.ramuan.harga)} koin*`,
            `◦ Koinmu: *${angka(p.koin)}*`,
          ]) +
          "\n\n" +
          bracketBox("💡", "ᴘɪʟɪʜᴀɴ", [
            `◦ Beli: *${prefix}tokorpg beli ramuan*`,
            `◦ Gratis: *${prefix}ramuan istirahat* (1 jam sekali)`,
          ]) +
          "\n\n" +
          bracketBox("❤️", "ᴋᴏɴᴅɪꜱɪ", [
            `◦ ${bar(p.hp, p.hpMaks, 10)}`,
            `◦ *${angka(p.hp)}/${angka(p.hpMaks)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Ramuan memulihkan 40% HP maksimal"),
      );
      return { handled: true };
    }

    if (!kurangiBarang(db, m.sender, "ramuan", 1)) {
      await m.reply(
        alyaHeader("Gagal", "❌") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Ramuan gagal dikeluarkan dari tas."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Coba lagi sebentar"),
      );
      return { handled: true };
    }

    const pulih = Math.floor(p.hpMaks * PULIH_PERSEN);
    const hpBaru = Math.min(p.hpMaks, p.hp + pulih);
    simpanPemain(db, m.sender, { hp: hpBaru });

    await m.reply(
      alyaHeader("Ramuan Diminum", "🧪") +
        "\n\n" +
        bracketBox("🧪", "ᴇꜰᴇᴋ", [
          `◦ HP pulih: *+${angka(hpBaru - p.hp)}*`,
          `◦ Sisa ramuan: *${punya - 1}*`,
        ]) +
        "\n\n" +
        bracketBox("❤️", "ᴋᴏɴᴅɪꜱɪ", [
          `◦ ${bar(hpBaru, p.hpMaks, 10)}`,
          `◦ *${angka(hpBaru)}/${angka(p.hpMaks)}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(
          hpBaru >= p.hpMaks
            ? `HP penuh, siap ${prefix}bertarung`
            : "Minum lagi bila masih kurang",
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
        tipText(`Ketik ${prefix}ramuan untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { PULIH_PERSEN, JEDA_ISTIRAHAT, ISTIRAHAT_PERSEN };
