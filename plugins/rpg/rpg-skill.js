// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "skill",
  alias: ["skill", "selectskill"],
  category: "rpg",
  description: "Menampilkan dan memilih skill/spesialisasi karakter RPG",
  usage: ".skill <nama_skill>",
  example: ".skill swordmaster",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const AVAILABLE_SKILLS = [
  "swordmaster",
  "necromancer",
  "witch",
  "archer",
  "magicswordmaster",
  "thief",
  "shadow",
];

async function handler(m, { sock, args }) {
  try {
    if (!db.data) db.data = {};
    if (!db.data.users) db.data.users = {};
    if (!db.data.users[m.sender]) {
      db.data.users[m.sender] = {
        money: 0,
        exp: 0,
        level: 1,
        health: 100,
        hunger: 50,
        thirst: 50,
        stamina: 100,
        fish: 0,
        coal: 0,
        gold: 0,
        diamond: 0,
        iron: 0,
        wood: 0,
        stone: 0,
      };
      await db.write();
    }

    const user = db.data.users[m.sender];
    const chosenSkill = (args && args[0] ? args[0] : "").toLowerCase();

    if (!chosenSkill) {
      return await m.reply(
        `⚔️ *SISTEM SKILL KARAKTER RPG*\n\n` +
        `🎯 Skill Kamu Saat Ini: *${user.skill ? user.skill.toUpperCase() : "Belum Memilih"}*\n\n` +
        `📜 *Daftar Skill Yang Tersedia:*\n` +
        `• *Swordmaster* (Spesialis Pedang & Fisik)\n` +
        `• *Necromancer* (Penyihir Ilmu Hitam & Arwah)\n` +
        `• *Witch* (Penyihir Ramuan & Sihir Elemen)\n` +
        `• *Archer* (Penembak Panah Jarak Jauh)\n` +
        `• *Magicswordmaster* (Kombinasi Pedang & Sihir)\n` +
        `• *Thief* (Pencuri & Kelincahan Tinggi)\n` +
        `• *Shadow* (Pembunuh Bayangan)\n\n` +
        `📌 *Cara Memilih Skill:*\n` +
        `*.skill swordmaster*`
      );
    }

    if (!AVAILABLE_SKILLS.includes(chosenSkill)) {
      return await m.reply(`❌ Skill *${chosenSkill}* tidak ditemukan dalam daftar! Pilih dari daftar skill.`);
    }

    if (user.skill) {
      return await m.reply(`⚠️ Kamu sudah memiliki skill *${user.skill.toUpperCase()}*! Skill tidak dapat diubah.`);
    }

    user.skill = chosenSkill;
    await db.write();

    await m.reply(
      `🎉 *SELAMAT! SKILL TERPILIH!*\n\n` +
      `🔥 Kamu berhasil memilih spesialisasi skill: *${chosenSkill.toUpperCase()}*!`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
