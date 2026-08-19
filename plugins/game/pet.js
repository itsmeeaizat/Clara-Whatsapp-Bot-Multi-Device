// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Pet — sistem peliharaan RPG
 * ---------------------------------------------------------------
 *   .pet             lihat peliharaan
 *   .pet tangkap     tangkap pet liar (2 stamina)
 *   .pet makan       beri makan pet (+exp, butuh ramuan)
 *   .pet lepas       lepaskan pet
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
  pakaiStamina,
  menitStaminaBerikutnya,
  kurangiBarang,
  JENIS_PET,
  ambilPet,
  bonusPet,
  bar,
  angka,
  STAMINA_MAKS,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "pet",
  alias: ["peliharaan", "mypet", "hewan"],
  category: "game",
  description: "Sistem peliharaan RPG — tangkap & pelihara pet",
  usage: ".pet [tangkap|makan|lepas]",
  example: ".pet",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const RARITAS_LABEL = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const RARITAS_WARNA = {
  common: "⚪",
  uncommon: "🟢",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
};

function undiPet(acakFn = Math.random) {
  const daftar = Object.entries(JENIS_PET);
  const total = daftar.reduce((a, [, v]) => a + v.bobot, 0);
  let n = acakFn() * total;
  for (const [kode, v] of daftar) {
    n -= v.bobot;
    if (n <= 0) return { kode, ...v };
  }
  const [kode, v] = daftar[0];
  return { kode, ...v };
}

async function handler(m, { sock, config }) {
  const prefix = config?.command?.prefix || ".";
  const db = m?.db || sock?.db;
  if (!db) return { handled: true };

  try {
    const p = ambilPemain(db, m.sender);
    if (!p) {
      await m.reply(
        alyaHeader("Pet", "🐾") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum terdaftar. Ketik *.petualang* dulu."])
      );
      return { handled: true };
    }

    const teks = (m.text || "").trim().toLowerCase();
    const sub = teks.split(/\s+/)[0];

    // --- .pet tangkap ---
    if (sub === "tangkap" || sub === "catch") {
      const petSekarang = ambilPet(p);
      if (petSekarang) {
        await m.reply(
          alyaHeader("Sudah Punya Pet", "🐾") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Kamu sudah punya ${JENIS_PET[petSekarang.jenis]?.ikon || ""} *${JENIS_PET[petSekarang.jenis]?.nama || "pet"}*`,
              `◦ Lepas dulu: *${prefix}pet lepas*`,
            ])
        );
        return { handled: true };
      }

      if (!pakaiStamina(db, m.sender, 2)) {
        await m.reply(
          alyaHeader("Stamina Habis", "😴") +
            "\n\n" +
            bracketBox("😴", "ɪɴꜰᴏ", [
              `◦ Stamina: *${p.stamina}/${STAMINA_MAKS}*`,
              `◦ Butuh: *2 stamina*`,
              `◦ Isi dalam: ${menitStaminaBerikutnya(p)} menit`,
            ])
        );
        return { handled: true };
      }

      const hasil = undiPet();

      // 40% gagal tangkap
      if (Math.random() < 0.4) {
        await m.reply(
          alyaHeader("Gagal Tangkap", "💨") +
            "\n\n" +
            bracketBox("💨", "ʜᴀꜱɪʟ", [
              `${hasil.ikon} *${hasil.nama}* kabur!`,
              `◦ Raritas: ${RARITAS_WARNA[hasil.raritas]} ${RARITAS_LABEL[hasil.raritas]}`,
            ]) +
            "\n\n" +
            tipText("Coba lagi nanti!")
        );
        return { handled: true };
      }

      const petBaru = {
        jenis: hasil.kode,
        nama: hasil.nama,
        level: 1,
        exp: 0,
        hunger: 100,
        ditangkap: Date.now(),
      };

      simpanPemain(db, m.sender, { peliharaan: petBaru });

      await m.reply(
        alyaHeader("Pet Berhasil Ditangkap! 🎉", "🐾") +
          "\n\n" +
          bracketBox("🎉", "ᴘᴇʟɪʜᴀʀᴀᴀɴ ʙᴀʀᴜ", [
            `${hasil.ikon} *${hasil.nama}*`,
            `◦ Raritas: ${RARITAS_WARNA[hasil.raritas]} *${RARITAS_LABEL[hasil.raritas]}*`,
            `◦ Bonus ATK: *+${hasil.atkBonus}*`,
            `◦ Bonus DEF: *+${hasil.defBonus}*`,
            `◦ Level: *1*`,
            `◦ Hunger: *100%*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Beri makan: ${prefix}pet makan`)
      );
      return { handled: true };
    }

    // --- .pet makan ---
    if (sub === "makan" || sub === "feed") {
      const pet = ambilPet(p);
      if (!pet) {
        await m.reply(
          alyaHeader("Tidak Ada Pet", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Kamu belum punya pet. Tangkap: *${prefix}pet tangkap*`])
        );
        return { handled: true };
      }

      // Butuh 1 ramuan
      if (!kurangiBarang(db, m.sender, "ramuan", 1)) {
        await m.reply(
          alyaHeader("Ramuan Habis", "❌") +
            "\n\n" +
            bracketBox("🧪", "ɪɴꜰᴏ", [
              `◦ Butuh: *1 Ramuan HP*`,
              `◦ Beli di: *${prefix}tokorpg beli ramuan*`,
              `◦ Atau craft: *${prefix}forge craft ramuan*`,
            ])
        );
        return { handled: true };
      }

      // Tambah exp pet, kurang hunger
      const expNaik = 20 + Math.floor(Math.random() * 20);
      const expBaru = (pet.exp || 0) + expNaik;
      const expMax = pet.level * 100;
      let levelBaru = pet.level;
      let sisaExp = expBaru;

      if (sisaExp >= expMax) {
        sisaExp -= expMax;
        levelBaru += 1;
      }

      const bonus = bonusPet({ peliharaan: { ...pet, level: levelBaru } });
      const infoPet = JENIS_PET[pet.jenis] || {};

      simpanPemain(db, m.sender, {
        peliharaan: {
          ...pet,
          level: levelBaru,
          exp: sisaExp,
          hunger: 100,
        },
      });

      await m.reply(
        alyaHeader("Pet Diberi Makan 🍖", "🐾") +
          "\n\n" +
          bracketBox("🍖", "ᴘᴇʟɪʜᴀʀᴀᴀɴ", [
            `◦ ${infoPet.ikon || ""} *${infoPet.nama || pet.nama}*`,
            `◦ Level: *${levelBaru}*${levelBaru > pet.level ? " ⬆️" : ""}`,
            `◦ Exp: *${sisaExp}/${levelBaru * 100}*`,
            `◦ Hunger: *100%*`,
          ]) +
          "\n\n" +
          bracketBox("⚔️", "ʙᴏɴᴜꜱ ᴀᴋᴛɪꜰ", [
            `◦ Bonus ATK: *+${bonus.atk}*`,
            `◦ Bonus DEF: *+${bonus.def}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Hunger berkurang seiring waktu — beri makan lagi nanti!")
      );
      return { handled: true };
    }

    // --- .pet lepas ---
    if (sub === "lepas" || sub === "release") {
      const pet = ambilPet(p);
      if (!pet) {
        await m.reply(
          alyaHeader("Tidak Ada Pet", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum punya pet."])
        );
        return { handled: true };
      }

      const infoPet = JENIS_PET[pet.jenis] || {};
      simpanPemain(db, m.sender, { peliharaan: null });

      await m.reply(
        alyaHeader("Pet Dilepas 🕊️", "🐾") +
          "\n\n" +
          bracketBox("🕊️", "ɪɴꜰᴏ", [
            `◦ ${infoPet.ikon || ""} *${infoPet.nama || pet.nama}* telah dilepas`,
            `◦ Level: *${pet.level || 1}*`,
          ]) +
          "\n\n" +
          tipText(`Tangkap pet baru: ${prefix}pet tangkap`)
      );
      return { handled: true };
    }

    // --- .pet (lihat) ---
    const pet = ambilPet(p);
    if (!pet) {
      await m.reply(
        alyaHeader("Pet", "🐾") +
          "\n\n" +
          bracketBox("🐾", "ɪɴꜰᴏ", [
            "◦ Kamu belum punya peliharaan.",
            `◦ Tangkap: *${prefix}pet tangkap* (2 stamina)`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Pet memberi bonus ATK & DEF passif")
      );
      return { handled: true };
    }

    const infoPet = JENIS_PET[pet.jenis] || {};
    const bonus = bonusPet(p);
    const expMax = (pet.level || 1) * 100;
    const persenExp = ((pet.exp || 0) / expMax) * 100;

    // Hitung hunger (turun 1% per 30 menit)
    const menitLewat = Math.floor((Date.now() - (pet.ditangkap || Date.now())) / 60000);
    const hungerTurun = Math.floor(menitLewat / 30);
    const hunger = Math.max(0, (pet.hunger || 100) - hungerTurun);

    await m.reply(
      alyaHeader("Peliharaan", "🐾") +
        "\n\n" +
        bracketBox("🐾", "ᴘᴇʟɪʜᴀʀᴀᴀɴ", [
          `◦ ${infoPet.ikon || ""} *${infoPet.nama || pet.nama}*`,
          `◦ Raritas: ${RARITAS_WARNA[infoPet.raritas] || "⚪"} *${RARITAS_LABEL[infoPet.raritas] || "Common"}*`,
          `◦ Level: *${pet.level || 1}*`,
        ]) +
        "\n\n" +
        bracketBox("📈", "ᴘʀᴏɢʀᴇꜱ", [
          `◦ ${bar(persenExp, 100)} *${pet.exp || 0}/${expMax} exp*`,
          `◦ Hunger: ${bar(hunger, 100)} *${hunger}%*`,
        ]) +
        "\n\n" +
        bracketBox("⚔️", "ʙᴏɴᴜꜱ ᴘᴀꜱꜱɪꜰ", [
          `◦ Bonus ATK: *+${bonus.atk}*`,
          `◦ Bonus DEF: *+${bonus.def}*`,
        ]) +
        "\n\n" +
        bracketBox("🍖", "ᴀᴋꜱɪ", [
          `◦ Beri makan: *${prefix}pet makan* (butuh 1 ramuan)`,
          `◦ Lepas: *${prefix}pet lepas*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(hunger < 30 ? "Pet lapar! Beri makan segera." : "Pet terlihat sehat.")
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
