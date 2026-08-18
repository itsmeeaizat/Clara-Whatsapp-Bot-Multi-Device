/**
 * Boss — informasi bos dunia
 * ---------------------------------------------------------------
 * Plugin ini dulu PLACEHOLDER berisi data karangan. Sistem bos yang
 * sesungguhnya kini ada di .raidbos, yang menyimpan HP bos per grup
 * dan membagi hadiah menurut sumbangan kerusakan tiap anggota.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { ambilPemain, angka } from "../../src/lib/clara-rpg-core.js";
import { BOS } from "../game/raid.js";

const pluginConfig = {
  name: "boss",
  alias: ["bossbattle", "attackboss", "bossfight"],
  category: "game",
  description: "Informasi bos dunia dan cara menantangnya bersama grup",
  usage: ".boss",
  example: ".boss",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const p = ambilPemain(db, m.sender);
    const daftar = BOS.map(
      (b) =>
        `◦ ${b.ikon} *${b.nama}*\n│     Lv ${b.lvlMin}+ · HP ${angka(b.hp)} · ${angka(b.koin)} koin` +
        (p.level >= b.lvlMin ? " ✅" : " 🔒"),
    );

    await m.reply(
      alyaHeader("Bos Dunia", "🐉") +
        "\n\n" +
        bracketBox("🐲", "ᴅᴀꜰᴛᴀʀ ʙᴏꜱ", daftar) +
        "\n\n" +
        bracketBox("⚔️", "ᴄᴀʀᴀ ᴍᴇɴᴀɴᴛᴀɴɢ", [
          `◦ Panggil bos: *${prefix}raidbos mulai*`,
          `◦ Menyerang: *${prefix}raidbos*`,
          `◦ Cek kondisi: *${prefix}raidbos info*`,
        ]) +
        "\n\n" +
        bracketBox("ℹ️", "ᴀᴛᴜʀᴀɴ", [
          "◦ Bos hanya bisa dilawan *di grup*.",
          "◦ HP bos sangat besar, butuh kerja sama.",
          "◦ Hadiah dibagi menurut sumbangan kerusakan.",
          `◦ Levelmu sekarang: *${p.level}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Bos yang muncul menyesuaikan level pemanggil"),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}boss untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
