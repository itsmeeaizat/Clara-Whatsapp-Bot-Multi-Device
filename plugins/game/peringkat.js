/**
 * Peringkat RPG
 * ---------------------------------------------------------------
 * Papan peringkat berdasarkan data RPG yang benar-benar tersimpan.
 *
 *   .peringkat            berdasarkan level
 *   .peringkat koin
 *   .peringkat monster
 *   .peringkat duel
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  bacaSemua,
  ambilPemain,
  levelDariExp,
  nomor,
  angka,
  labelKelas,
  KELAS,
  KELAS_BAWAAN,
} from "../../src/lib/clara-rpg-core.js";

const MEDALI = ["🥇", "🥈", "🥉"];

const MODE = {
  level: {
    nama: "Level Tertinggi",
    ikon: "📈",
    nilai: (u) => levelDariExp(u.exp || 0),
    format: (v, u) => `Lv *${v}* · ${angka(u.exp || 0)} exp`,
  },
  koin: {
    nama: "Terkaya",
    ikon: "💰",
    nilai: (u) => Math.max(0, Number(u.koin) || 0),
    format: (v) => `*${angka(v)}* koin`,
  },
  monster: {
    nama: "Pemburu Monster",
    ikon: "⚔️",
    nilai: (u) => u.rpg?.statistik?.monster || 0,
    format: (v) => `*${angka(v)}* monster`,
  },
  bos: {
    nama: "Penakluk Bos",
    ikon: "🐉",
    nilai: (u) => u.rpg?.statistik?.bosDikalahkan || 0,
    format: (v) => `*${angka(v)}* bos`,
  },
  duel: {
    nama: "Juara Duel",
    ikon: "🏆",
    nilai: (u) => u.rpg?.statistik?.menang || 0,
    format: (v, u) => {
      const kalah = u.rpg?.statistik?.kalah || 0;
      const total = v + kalah;
      const rasio = total ? Math.round((v / total) * 100) : 0;
      return `*${v}M/${kalah}K* (${rasio}%)`;
    },
  },
};

const pluginConfig = {
  name: "papanrpg",
  alias: ["rankrpg", "toprpg", "klasemen", "juara"],
  category: "game",
  description: "Papan peringkat RPG: level, koin, monster, bos, dan duel",
  usage: ".papanrpg [level|koin|monster|bos|duel]",
  example: ".papanrpg koin",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const sub = (m.text || "").trim().toLowerCase().split(/\s+/)[0];
    const kunci = MODE[sub] ? sub : "level";
    const mode = MODE[kunci];

    // Gabungkan data user inti dengan data RPG
    const rpgSemua = bacaSemua(db);
    let users = [];
    try {
      users = db?.getAllUsers?.() || [];
    } catch {
      users = [];
    }
    if (!Array.isArray(users)) users = Object.values(users || {});

    const gabung = users
      .filter((u) => u && (u.jid || u.number))
      .map((u) => {
        const id = String(u.jid || u.number);
        return { ...u, id, rpg: rpgSemua[id] || {} };
      });

    const urut = gabung
      .map((u) => ({ u, v: mode.nilai(u) }))
      .filter((x) => x.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 10);

    if (!urut.length) {
      await m.reply(
        alyaHeader("Peringkat Kosong", "📊") +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            `◦ Belum ada data untuk *${mode.nama}*.`,
            "◦ Mainkan dulu, lalu cek lagi.",
          ]) +
          "\n\n" +
          bracketBox("🎮", "ᴍᴜʟᴀɪ ᴅᴀʀɪ", [
            `◦ *${prefix}tambangrpg* — kumpulkan koin`,
            `◦ *${prefix}bertarung* — lawan monster`,
            `◦ *${prefix}petualang* — lihat karaktermu`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Jadilah yang pertama masuk papan peringkat"),
      );
      return { handled: true };
    }

    const baris = urut.map(({ u, v }, i) => {
      const medali = MEDALI[i] || `${String(i + 1).padStart(2, "0")}.`;
      const nama = String(u.name || "Petualang").slice(0, 18);
      const kelas = KELAS[u.rpg?.kelas] ? KELAS[u.rpg.kelas].ikon : KELAS[KELAS_BAWAAN].ikon;
      return `◦ ${medali} ${kelas} *${nama}*\n│     ${mode.format(v, u)}`;
    });

    // Posisi pemain yang bertanya
    const akuId = nomor(m.sender);
    const semuaTerurut = gabung
      .map((u) => ({ u, v: mode.nilai(u) }))
      .filter((x) => x.v > 0)
      .sort((a, b) => b.v - a.v);
    const posisi = semuaTerurut.findIndex((x) => x.u.id === akuId);
    const pAku = ambilPemain(db, m.sender);

    const bagian = [
      alyaHeader(`Peringkat ${mode.nama}`, mode.ikon),
      "\n\n",
      bracketBox("🏅", "ᴘᴇʀɪɴɢᴋᴀᴛ ᴛᴇʀᴀᴛᴀꜱ", baris),
      "\n\n",
      bracketBox("👤", "ᴘᴏꜱɪꜱɪᴍᴜ", [
        posisi >= 0
          ? `◦ Peringkat *#${posisi + 1}* dari ${semuaTerurut.length} pemain`
          : "◦ Kamu belum masuk peringkat ini.",
        `◦ ${labelKelas(pAku.kelas)} · Level *${pAku.level}*`,
      ]),
      "\n\n",
      bracketBox("🔀", "ᴍᴏᴅᴇ ʟᴀɪɴ", [
        `◦ ${Object.keys(MODE)
          .filter((k) => k !== kunci)
          .map((k) => prefix + "peringkat " + k)
          .join(" · ")}`,
      ]),
      "\n\n",
      separator(),
      "\n",
      tipText("Peringkat dihitung dari data yang benar-benar tersimpan"),
    ];

    await m.reply(bagian.join(""));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}papanrpg untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { MODE, MEDALI };
