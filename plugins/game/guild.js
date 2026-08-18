/**
 * Guild — sistem guild/komunitas RPG
 * ---------------------------------------------------------------
 *   .guild              lihat guild kamu
 *   .guild buat <nama>  buat guild baru (5000 koin)
 *   .guild gabung <nama> gabung guild
 *   .guild keluar       keluar dari guild
 *   .guild info         info guild detail
 *   .guild anggota      daftar anggota guild
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
  angka,
  bar,
  nomor,
  KEY_GUILD,
  GUILD_MAKS_ANGGOTA,
  GUILD_BIAYA_BUAT,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "guild",
  alias: ["clanrpg", "komunitas", "gilderpg"],
  category: "game",
  description: "Guild RPG — buat, gabung, kelola guild",
  usage: ".guild [buat <nama> | gabung <nama> | keluar | info | anggota]",
  example: ".guild",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function bacaGuild(db) {
  try {
    const data = db?.get?.(KEY_GUILD);
    if (data && typeof data === "object") return data;
  } catch {}
  try {
    const data = db?.setting?.(KEY_GUILD);
    if (data && typeof data === "object") return data;
  } catch {}
  return {};
}

function simpanGuild(db, data) {
  try {
    if (db?.set) {
      db.set(KEY_GUILD, data);
      return true;
    }
  } catch {}
  try {
    if (db?.setting) {
      db.setting(KEY_GUILD, data);
      return true;
    }
  } catch {}
  return false;
}

function levelGuild(exp) {
  return Math.floor((exp || 0) / 5000) + 1;
}

function expUntukLevel(lvl) {
  return (lvl - 1) * 5000;
}

async function handler(m, { sock, config }) {
  const prefix = config?.command?.prefix || ".";
  const db = m?.db || sock?.db;
  if (!db) return { handled: true };

  try {
    const p = ambilPemain(db, m.sender);
    if (!p) {
      await m.reply(
        alyaHeader("Guild", "🏰") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum terdaftar. Ketik *.petualang* dulu."])
      );
      return { handled: true };
    }

    const teks = (m.text || "").trim();
    const parts = teks.split(/\s+/);
    const sub = (parts[0] || "").toLowerCase();
    const semuaGuild = bacaGuild(db);

    // --- .guild buat <nama> ---
    if (sub === "buat" || sub === "create") {
      const namaGuild = teks.split(/\s+/).slice(1).join(" ").trim();
      if (!namaGuild) {
        await m.reply(
          alyaHeader("Buat Guild", "🏰") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Format: *${prefix}guild buat <nama>*`])
        );
        return { handled: true };
      }

      if (namaGuild.length > 20) {
        await m.reply(
          alyaHeader("Buat Guild", "🏰") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Nama guild maksimal 20 karakter."])
        );
        return { handled: true };
      }

      // Cek sudah punya guild
      if (p.guild) {
        await m.reply(
          alyaHeader("Sudah Ada Guild", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Kamu sudah di guild *${p.guild}*`,
              `◦ Keluar dulu: *${prefix}guild keluar*`,
            ])
        );
        return { handled: true };
      }

      // Cek nama sudah dipakai
      if (semuaGuild[namaGuild.toLowerCase()]) {
        await m.reply(
          alyaHeader("Nama Sudah Dipakai", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Guild *${namaGuild}* sudah ada.`])
        );
        return { handled: true };
      }

      // Cek koin
      if (p.koin < GUILD_BIAYA_BUAT) {
        await m.reply(
          alyaHeader("Koin Kurang", "❌") +
            "\n\n" +
            bracketBox("💰", "ɪɴꜰᴏ", [
              `◦ Biaya buat guild: *${angka(GUILD_BIAYA_BUAT)} koin*`,
              `◦ Koin kamu: *${angka(p.koin)}*`,
            ])
        );
        return { handled: true };
      }

      // Eksekusi
      if (!ambilKoin(db, m.sender, GUILD_BIAYA_BUAT)) {
        await m.reply(
          alyaHeader("Gagal", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Gagal memotong koin."])
        );
        return { handled: true };
      }

      const guildBaru = {
        nama: namaGuild,
        pemilik: nomor(m.sender),
        namaPemilik: p.nama,
        anggota: [nomor(m.sender)],
        level: 1,
        exp: 0,
        dibuat: Date.now(),
      };

      semuaGuild[namaGuild.toLowerCase()] = guildBaru;
      simpanGuild(db, semuaGuild);
      simpanPemain(db, m.sender, { guild: namaGuild });

      await m.reply(
        alyaHeader("Guild Dibuat! 🎉", "🏰") +
          "\n\n" +
          bracketBox("🎉", "ɢᴜɪʟᴅ ʙᴀʀᴜ", [
            `◦ Nama: *${namaGuild}*`,
            `◦ Pemilik: *${p.nama}*`,
            `◦ Level: *1*`,
            `◦ Anggota: *1/${GUILD_MAKS_ANGGOTA}*`,
            `◦ Biaya: *${angka(GUILD_BIAYA_BUAT)} koin*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ajak teman gabung: ${prefix}guild gabung ${namaGuild}`)
      );
      return { handled: true };
    }

    // --- .guild gabung <nama> ---
    if (sub === "gabung" || sub === "join") {
      const namaGuild = teks.split(/\s+/).slice(1).join(" ").trim();
      if (!namaGuild) {
        await m.reply(
          alyaHeader("Gabung Guild", "🏰") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Format: *${prefix}guild gabung <nama>*`])
        );
        return { handled: true };
      }

      if (p.guild) {
        await m.reply(
          alyaHeader("Sudah Ada Guild", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Kamu sudah di guild *${p.guild}*`,
              `◦ Keluar dulu: *${prefix}guild keluar*`,
            ])
        );
        return { handled: true };
      }

      const guild = semuaGuild[namaGuild.toLowerCase()];
      if (!guild) {
        await m.reply(
          alyaHeader("Guild Tidak Ada", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Guild *${namaGuild}* tidak ditemukan.`])
        );
        return { handled: true };
      }

      if (guild.anggota.length >= GUILD_MAKS_ANGGOTA) {
        await m.reply(
          alyaHeader("Guild Penuh", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Guild *${guild.nama}* sudah penuh (${GUILD_MAKS_ANGGOTA} anggota).`,
            ])
        );
        return { handled: true };
      }

      if (guild.anggota.includes(nomor(m.sender))) {
        await m.reply(
          alyaHeader("Sudah Anggota", "✅") +
            "\n\n" +
            bracketBox("✅", "ɪɴꜰᴏ", ["◦ Kamu sudah anggota guild ini."])
        );
        return { handled: true };
      }

      // Gabung
      guild.anggota.push(nomor(m.sender));
      semuaGuild[namaGuild.toLowerCase()] = guild;
      simpanGuild(db, semuaGuild);
      simpanPemain(db, m.sender, { guild: guild.nama });

      await m.reply(
        alyaHeader("Bergabung! 🎉", "🏰") +
          "\n\n" +
          bracketBox("✅", "ɢᴜɪʟᴅ", [
            `◦ Nama: *${guild.nama}*`,
            `◦ Anggota: *${guild.anggota.length}/${GUILD_MAKS_ANGGOTA}*`,
          ]) +
          "\n\n" +
          tipText(`Lihat info: ${prefix}guild info`)
      );
      return { handled: true };
    }

    // --- .guild keluar ---
    if (sub === "keluar" || sub === "leave") {
      if (!p.guild) {
        await m.reply(
          alyaHeader("Tidak Ada Guild", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum tergabung guild mana pun."])
        );
        return { handled: true };
      }

      const guild = semuaGuild[p.guild.toLowerCase()];
      if (!guild) {
        // Guild sudah hilang dari DB, bersihkan saja
        simpanPemain(db, m.sender, { guild: null });
        await m.reply(
          alyaHeader("Guild Tidak Ditemukan", "❌") +
            "\n\n" +
            bracketBox("✅", "ɪɴꜰᴏ", ["◦ Data guild sudah dibersihkan dari profilmu."])
        );
        return { handled: true };
      }

      // Pemilik tidak bisa keluar
      if (guild.pemilik === nomor(m.sender)) {
        await m.reply(
          alyaHeader("Pemilik Tidak Bisa Keluar", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Kamu pemilik *${guild.nama}*`,
              "◦ Pemilik tidak bisa keluar. Guild harus dibubarkan.",
            ])
        );
        return { handled: true };
      }

      // Keluar
      guild.anggota = guild.anggota.filter((a) => a !== nomor(m.sender));
      semuaGuild[p.guild.toLowerCase()] = guild;
      simpanGuild(db, semuaGuild);
      simpanPemain(db, m.sender, { guild: null });

      await m.reply(
        alyaHeader("Keluar Guild", "👋") +
          "\n\n" +
          bracketBox("👋", "ɪɴꜰᴏ", [
            `◦ Kamu keluar dari *${guild.nama}*`,
            `◦ Sisa anggota: *${guild.anggota.length}/${GUILD_MAKS_ANGGOTA}*`,
          ]) +
          "\n\n" +
          tipText(`Gabung guild lain: ${prefix}guild gabung <nama>`)
      );
      return { handled: true };
    }

    // --- .guild info ---
    if (sub === "info" || sub === "detail") {
      if (!p.guild) {
        await m.reply(
          alyaHeader("Guild", "🏰") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum tergabung guild mana pun."])
        );
        return { handled: true };
      }

      const guild = semuaGuild[p.guild.toLowerCase()];
      if (!guild) {
        await m.reply(
          alyaHeader("Guild Tidak Ditemukan", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Data guild hilang. Hubungi owner."])
        );
        return { handled: true };
      }

      const lvl = levelGuild(guild.exp);
      const expLevel = expUntukLevel(lvl);
      const expNext = expUntukLevel(lvl + 1);
      const persen = ((guild.exp - expLevel) / (expNext - expLevel)) * 100;

      await m.reply(
        alyaHeader("Guild Info", "🏰") +
          "\n\n" +
          bracketBox("🏰", "ɪɴꜰᴏ ɢᴜɪʟᴅ", [
            `◦ Nama: *${guild.nama}*`,
            `◦ Pemilik: *${guild.namaPemilik || "Unknown"}*`,
            `◦ Level: *${lvl}*`,
            `◦ Exp: *${angka(guild.exp)}* / ${angka(expNext)}`,
            `◦ Progres: ${bar ? "" : ""}${persen.toFixed(1)}% menuju level ${lvl + 1}`,
            `◦ Anggota: *${guild.anggota.length}/${GUILD_MAKS_ANGGOTA}*`,
            `◦ Dibuat: *${new Date(guild.dibuat).toLocaleDateString("id-ID")}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Daftar anggota: ${prefix}guild anggota`)
      );
      return { handled: true };
    }

    // --- .guild anggota ---
    if (sub === "anggota" || sub === "members") {
      if (!p.guild) {
        await m.reply(
          alyaHeader("Guild", "🏰") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum tergabung guild mana pun."])
        );
        return { handled: true };
      }

      const guild = semuaGuild[p.guild.toLowerCase()];
      if (!guild) {
        await m.reply(
          alyaHeader("Guild Tidak Ditemukan", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Data guild hilang."])
        );
        return { handled: true };
      }

      const lines = [];
      for (let i = 0; i < guild.anggota.length; i++) {
        const anggotaJid = `${guild.anggota[i]}@s.whatsapp.net`;
        const anggotaPemain = ambilPemain(db, anggotaJid);
        const isOwner = guild.anggota[i] === guild.pemilik;
        const nama = anggotaPemain?.nama || `Petualang ${i + 1}`;
        lines.push(`${isOwner ? "👑" : "👤"} *${nama}* — Lv.${anggotaPemain?.level || 1}`);
      }

      await m.reply(
        alyaHeader("Anggota Guild", "🏰") +
          "\n\n" +
          bracketBox("🏰", "ɢᴜɪʟᴅ", [`◦ Nama: *${guild.nama}*`]) +
          "\n\n" +
          bracketBox("👥", "ᴀɴɢɢᴏᴛᴀ", lines) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Total: ${guild.anggota.length}/${GUILD_MAKS_ANGGOTA} anggota`)
      );
      return { handled: true };
    }

    // --- .guild (status) ---
    if (p.guild) {
      const guild = semuaGuild[p.guild.toLowerCase()];
      if (guild) {
        const lvl = levelGuild(guild.exp);
        const isOwner = guild.pemilik === nomor(m.sender);

        await m.reply(
          alyaHeader("Guild", "🏰") +
            "\n\n" +
            bracketBox("🏰", "ɢᴜɪʟᴅᴋᴜ", [
              `◦ Nama: *${guild.nama}*`,
              `◦ Role: *${isOwner ? "👑 Pemilik" : "👤 Anggota"}*`,
              `◦ Level: *${lvl}*`,
              `◦ Anggota: *${guild.anggota.length}/${GUILD_MAKS_ANGGOTA}*`,
              `◦ Exp: *${angka(guild.exp)}*`,
            ]) +
            "\n\n" +
            bracketBox("🎯", "ᴀᴋꜱɪ", [
              `◦ Info: *${prefix}guild info*`,
              `◦ Anggota: *${prefix}guild anggota*`,
              isOwner ? "" : `◦ Keluar: *${prefix}guild keluar*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Guild mendapat exp dari aktivitas anggota")
        );
        return { handled: true };
      }
    }

    // Tidak punya guild
    await m.reply(
      alyaHeader("Guild", "🏰") +
        "\n\n" +
        bracketBox("🏰", "ꜱᴛᴀᴛᴜꜱ", ["◦ Kamu belum tergabung guild mana pun."]) +
        "\n\n" +
        bracketBox("🎯", "ᴀᴋꜱɪ", [
          `◦ Buat guild: *${prefix}guild buat <nama>* (${angka(GUILD_BIAYA_BUAT)} koin)`,
          `◦ Gabung guild: *${prefix}guild gabung <nama>*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Guild memberi bonus komunitas dan bisa ikut raid bersama")
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
