// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Arena — papan peringkat pertarungan
 * ---------------------------------------------------------------
 * Dulu PLACEHOLDER berisi peringkat karangan. Kini membaca statistik
 * duel yang benar-benar tersimpan dari clara-rpg-core.
 *
 *   .arena
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  bacaSemua,
  nomor,
  angka,
  labelKelas,
  KELAS,
  KELAS_BAWAAN,
  kekuatanSerang,
  kekuatanBela,
} from "../../src/lib/clara-rpg-core.js";

const MEDALI = ["🥇", "🥈", "🥉"];

const pluginConfig = {
  name: "arena",
  alias: ["pvpg", "duelrank", "fightrank"],
  category: "game",
  description: "Papan peringkat arena berdasarkan kemenangan duel",
  usage: ".arena",
  example: ".arena",
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
    const rpgSemua = bacaSemua(db);
    let users = [];
    try {
      users = db?.getAllUsers?.() || [];
    } catch {
      users = [];
    }
    if (!Array.isArray(users)) users = Object.values(users || {});

    const petarung = users
      .filter((u) => u && (u.jid || u.number))
      .map((u) => {
        const id = String(u.jid || u.number);
        const rpg = rpgSemua[id] || {};
        const st = rpg.statistik || {};
        const menang = st.menang || 0;
        const kalah = st.kalah || 0;
        return { id, nama: u.name || "Petarung", kelas: rpg.kelas, menang, kalah };
      })
      .filter((x) => x.menang + x.kalah > 0)
      .sort((a, b) => b.menang - a.menang || a.kalah - b.kalah)
      .slice(0, 10);

    const p = ambilPemain(db, m.sender);
    const st = p.statistik || {};
    const totalku = (st.menang || 0) + (st.kalah || 0);
    const rasioku = totalku ? Math.round(((st.menang || 0) / totalku) * 100) : 0;

    const bagian = [alyaHeader("Arena Duel", "🏟️"), "\n\n"];

    if (petarung.length) {
      const baris = petarung.map((x, i) => {
        const medali = MEDALI[i] || `${String(i + 1).padStart(2, "0")}.`;
        const ikon = KELAS[x.kelas]?.ikon || KELAS[KELAS_BAWAAN].ikon;
        const total = x.menang + x.kalah;
        const rasio = total ? Math.round((x.menang / total) * 100) : 0;
        return `◦ ${medali} ${ikon} *${String(x.nama).slice(0, 16)}*\n│     ${x.menang}M / ${x.kalah}K · ${rasio}% menang`;
      });
      bagian.push(bracketBox("🏅", "ᴘᴇʀɪɴɢᴋᴀᴛ", baris), "\n\n");
    } else {
      bagian.push(
        bracketBox("ℹ️", "ɪɴꜰᴏ", [
          "◦ Belum ada duel yang tercatat.",
          `◦ Mulai dengan *${prefix}duelrpg @orang 1000*`,
        ]),
        "\n\n",
      );
    }

    bagian.push(
      bracketBox("👤", "ᴋᴀᴛᴀᴛᴀɴᴍᴜ", [
        `◦ ${labelKelas(p.kelas)} · Level *${p.level}*`,
        `◦ Rekor: *${st.menang || 0}M / ${st.kalah || 0}K* (${rasioku}%)`,
        `◦ Serangan: *${angka(kekuatanSerang(p))}* · Bela: *${angka(kekuatanBela(p))}*`,
      ]),
      "\n\n",
      bracketBox("⚔️", "ᴄᴀʀᴀ ɪᴋᴜᴛ", [
        `◦ Tantang: *${prefix}duelrpg @orang <taruhan>*`,
        `◦ Terima: *${prefix}duelrpg terima*`,
        "◦ Duel hanya bisa di grup.",
      ]),
      "\n\n",
      separator(),
      "\n",
      tipText("Menang duel menaikkan peringkat dan koinmu"),
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
        tipText(`Ketik ${prefix}arena untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
