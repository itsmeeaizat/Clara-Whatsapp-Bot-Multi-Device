/**
 * Hunt — berburu monster
 * ---------------------------------------------------------------
 * Sebelumnya plugin ini hanya PLACEHOLDER: gold dan exp-nya diacak
 * lalu dibuang begitu saja. Kini tersambung ke clara-rpg-core
 * sehingga hasil berburu benar-benar masuk ke koin dan exp pemain.
 *
 *   .hunt
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
  beriHadiah,
  tambahBarang,
  hitungSerangan,
  kekuatanBela,
  monsterUntukLevel,
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  bar,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const BIAYA_STAMINA = 1;

const pluginConfig = {
  name: "hunt",
  alias: ["hunting", "mburu", "berburu"],
  category: "game",
  description: "Berburu monster untuk koin dan exp, hasilnya tersimpan",
  usage: ".hunt",
  example: ".hunt",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 20,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const p = ambilPemain(db, m.sender);

    if (p.hp <= 0) {
      await m.reply(
        alyaHeader("Kamu Tumbang", "💀") +
          "\n\n" +
          bracketBox("💀", "ᴋᴏɴᴅɪꜱɪ", [`◦ Pulihkan HP dengan *${prefix}ramuan*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Tidak bisa berburu dalam kondisi tumbang"),
      );
      return { handled: true };
    }

    if (p.stamina < BIAYA_STAMINA) {
      await m.reply(
        alyaHeader("Stamina Habis", "😮‍💨") +
          "\n\n" +
          bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
            `◦ Punya: *${p.stamina}/${STAMINA_MAKS}*`,
            `◦ Pulih +1 dalam *${menitStaminaBerikutnya(p)} menit*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Stamina pulih sendiri seiring waktu"),
      );
      return { handled: true };
    }

    pakaiStamina(db, m.sender, BIAYA_STAMINA);

    const monster = monsterUntukLevel(p.level);
    // Berburu lebih ringan daripada .bertarung: monster sudah terluka
    let hpMonster = Math.floor(monster.hp * 0.6);
    let hpPemain = p.hp;
    const bela = kekuatanBela(p);
    let ronde = 0;

    while (hpMonster > 0 && hpPemain > 0 && ronde < 8) {
      ronde++;
      const s = hitungSerangan(p, Math.floor(monster.serang * 0.4));
      hpMonster -= s.damage;
      if (hpMonster > 0) {
        const balas = Math.max(1, Math.floor(monster.serang * 0.6 - bela * 0.4));
        hpPemain = Math.max(0, hpPemain - balas);
      }
    }

    const menang = hpMonster <= 0;
    const st = { ...(p.statistik || {}) };
    let hadiah = null;

    if (menang) {
      const koin = Math.floor(monster.koin * 0.7 * (0.9 + Math.random() * 0.2));
      const exp = Math.floor(monster.exp * 0.7);
      hadiah = beriHadiah(db, m.sender, koin, exp);
      st.monster = (st.monster || 0) + 1;
    }

    simpanPemain(db, m.sender, { hp: hpPemain, statistik: st });

    let jarahan = null;
    if (menang && Math.random() < 0.18) {
      jarahan = Math.random() < 0.7 ? "ramuan" : "batu_asah";
      tambahBarang(db, m.sender, jarahan, 1);
    }

    const bagian = [
      alyaHeader(menang ? "Buruan Didapat" : "Buruan Lolos", menang ? "🏹" : "💨"),
      "\n\n",
      bracketBox(monster.ikon, "ᴍᴏɴꜱᴛᴇʀ", [
        `◦ ${monster.ikon} *${monster.nama}* (Lv ${monster.lvl})`,
        `◦ Bertahan *${ronde} ronde*`,
      ]),
      "\n\n",
      bracketBox("❤️", "ᴋᴏɴᴅɪꜱɪᴍᴜ", [
        `◦ HP: ${bar(hpPemain, p.hpMaks, 8)} *${angka(hpPemain)}/${angka(p.hpMaks)}*`,
      ]),
    ];

    if (menang && hadiah) {
      bagian.push(
        "\n\n",
        bracketBox("💰", "ʜᴀꜱɪʟ", [
          `◦ Koin: *+${angka(hadiah.koin)}*`,
          `◦ Exp: *+${angka(hadiah.exp)}*`,
          jarahan ? `◦ Jarahan: *${jarahan.replace(/_/g, " ")}*` : null,
        ].filter(Boolean)),
      );
      if (hadiah.naikLevel) {
        bagian.push(
          "\n\n",
          bracketBox("🎉", "ɴᴀɪᴋ ʟᴇᴠᴇʟ", [
            `◦ Level *${hadiah.levelLama}* → *${hadiah.levelBaru}*`,
          ]),
        );
      }
    } else {
      bagian.push(
        "\n\n",
        bracketBox("💨", "ɢᴀɢᴀʟ", ["◦ Monster berhasil kabur.", "◦ Tidak ada hadiah."]),
      );
    }

    bagian.push(
      "\n\n",
      separator(),
      "\n",
      tipText(`${prefix}bertarung untuk lawan yang lebih menantang`),
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
        tipText(`Ketik ${prefix}hunt untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
