/**
 * Raid — melawan bos bersama satu grup
 * ---------------------------------------------------------------
 * Bos punya HP sangat besar sehingga mustahil dijatuhkan sendirian.
 * Setiap anggota grup menyerang bergiliran, dan hadiahnya dibagi
 * menurut sumbangan kerusakan masing-masing.
 *
 *   .raid mulai      memanggil bos ke grup
 *   .raid            menyerang bos
 *   .raid info       melihat kondisi bos
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
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  bar,
  angka,
  nomor,
  labelKelas,
} from "../../src/lib/clara-rpg-core.js";
import { readGroupState, writeGroupState } from "../../src/lib/clara-group-util.js";

const KEY = "rpgRaid";
const DURASI = 30 * 60 * 1000; // bos kabur setelah 30 menit
const BIAYA_STAMINA = 2;
const JEDA_SERANG = 20 * 1000; // jeda antar serangan per pemain

const BOS = [
  { nama: "Raja Goblin", ikon: "👺", lvlMin: 1, hp: 3000, serang: 40, koin: 8000, exp: 1200 },
  { nama: "Golem Purba", ikon: "🗿", lvlMin: 10, hp: 8000, serang: 70, koin: 20000, exp: 3000 },
  { nama: "Naga Merah", ikon: "🐉", lvlMin: 20, hp: 20000, serang: 120, koin: 55000, exp: 8000 },
  { nama: "Raja Iblis", ikon: "😈", lvlMin: 35, hp: 50000, serang: 200, koin: 150000, exp: 20000 },
];

/** Ambil raid aktif, atau null bila sudah kedaluwarsa. */
function raidAktif(db, chat) {
  const r = readGroupState(db, KEY, chat, null);
  if (!r || !r.mulai) return null;
  if (Date.now() - r.mulai > DURASI) return null;
  if (r.hp <= 0) return null;
  return r;
}

const pluginConfig = {
  name: "raidbos",
  alias: ["bosgrup", "serbu", "worldboss"],
  category: "game",
  description: "Lawan bos raksasa bersama satu grup, hadiah dibagi rata",
  usage: ".raidbos [mulai|info]",
  example: ".raidbos mulai",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const sub = (m.text || "").trim().toLowerCase().split(/\s+/)[0];
    const aku = nomor(m.sender);
    const aktif = raidAktif(db, m.chat);

    /* --- memanggil bos --- */
    if (["mulai", "start", "panggil", "summon"].includes(sub)) {
      if (aktif) {
        await m.reply(
          alyaHeader("Bos Masih Hidup", "⚔️") +
            "\n\n" +
            bracketBox(aktif.ikon, "ʙᴏꜱ ᴀᴋᴛɪꜰ", [
              `◦ ${aktif.ikon} *${aktif.nama}*`,
              `◦ HP: ${bar(aktif.hp, aktif.hpMaks, 10)}`,
              `◦ *${angka(aktif.hp)}/${angka(aktif.hpMaks)}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}raidbos untuk ikut menyerang`),
        );
        return { handled: true };
      }

      const p = ambilPemain(db, m.sender);
      const layak = BOS.filter((b) => b.lvlMin <= p.level);
      const bos = layak.length ? layak[layak.length - 1] : BOS[0];

      writeGroupState(db, KEY, m.chat, {
        nama: bos.nama,
        ikon: bos.ikon,
        hp: bos.hp,
        hpMaks: bos.hp,
        serang: bos.serang,
        koin: bos.koin,
        exp: bos.exp,
        mulai: Date.now(),
        peserta: {},
        pemanggil: aku,
      });

      await m.reply(
        alyaHeader("Bos Muncul!", "🚨") +
          "\n\n" +
          bracketBox(bos.ikon, "ʙᴏꜱ", [
            `◦ ${bos.ikon} *${bos.nama}*`,
            `◦ HP: *${angka(bos.hp)}*`,
            `◦ Serangan: *${angka(bos.serang)}*`,
          ]) +
          "\n\n" +
          bracketBox("🎁", "ʜᴀᴅɪᴀʜ", [
            `◦ Total koin: *${angka(bos.koin)}*`,
            `◦ Total exp: *${angka(bos.exp)}*`,
            "◦ Dibagi menurut sumbangan kerusakan.",
          ]) +
          "\n\n" +
          bracketBox("⏰", "ᴡᴀᴋᴛᴜ", [
            "◦ Bos kabur setelah *30 menit*.",
            `◦ Biaya serang: *${BIAYA_STAMINA} stamina*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Semua anggota ketik ${prefix}raidbos untuk menyerang!`),
      );
      return { handled: true };
    }

    /* --- info --- */
    if (["info", "status", "cek"].includes(sub)) {
      if (!aktif) {
        await m.reply(
          alyaHeader("Tidak Ada Bos", "😴") +
            "\n\n" +
            bracketBox("ℹ️", "ɪɴꜰᴏ", ["◦ Belum ada raid yang berjalan."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}raidbos mulai untuk memanggil bos`),
        );
        return { handled: true };
      }

      const urut = Object.entries(aktif.peserta || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      const sisaMenit = Math.max(
        0,
        Math.ceil((DURASI - (Date.now() - aktif.mulai)) / 60000),
      );

      await m.reply(
        alyaHeader("Kondisi Bos", aktif.ikon) +
          "\n\n" +
          bracketBox(aktif.ikon, "ʙᴏꜱ", [
            `◦ *${aktif.nama}*`,
            `◦ ${bar(aktif.hp, aktif.hpMaks, 12)}`,
            `◦ HP: *${angka(aktif.hp)}/${angka(aktif.hpMaks)}* (${Math.round((aktif.hp / aktif.hpMaks) * 100)}%)`,
            `◦ Kabur dalam: *${sisaMenit} menit*`,
          ]) +
          "\n\n" +
          bracketBox("🏅", "ᴘᴇɴʏᴜᴍʙᴀɴɢ", 
            urut.length
              ? urut.map(
                  ([no, dmg], i) =>
                    `◦ ${i + 1}. @${no} — *${angka(dmg)}* dmg`,
                )
              : ["◦ Belum ada yang menyerang."],
          ) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}raidbos untuk menyerang`),
        { mentions: urut.map(([no]) => `${no}@s.whatsapp.net`) },
      );
      return { handled: true };
    }

    /* --- menyerang --- */
    if (!aktif) {
      await m.reply(
        alyaHeader("Tidak Ada Bos", "😴") +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [
            "◦ Belum ada raid yang berjalan.",
            `◦ Panggil bos dengan *${prefix}raidbos mulai*`,
          ]) +
          "\n\n" +
          bracketBox("🐉", "ᴅᴀꜰᴛᴀʀ ʙᴏꜱ", 
            BOS.map((b) => `◦ ${b.ikon} *${b.nama}* — mulai Lv ${b.lvlMin}`),
          ) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Bos yang muncul menyesuaikan level pemanggil"),
      );
      return { handled: true };
    }

    const p = ambilPemain(db, m.sender);

    if (p.hp <= 0) {
      await m.reply(
        alyaHeader("Kamu Tumbang", "💀") +
          "\n\n" +
          bracketBox("💀", "ɪɴꜰᴏ", [`◦ Pulihkan HP dengan *${prefix}ramuan*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Tidak bisa menyerang dalam kondisi tumbang"),
      );
      return { handled: true };
    }

    // Jeda antar serangan agar tidak dibanjiri satu orang
    const terakhir = (aktif.jeda || {})[aku] || 0;
    if (Date.now() - terakhir < JEDA_SERANG) {
      const sisa = Math.ceil((JEDA_SERANG - (Date.now() - terakhir)) / 1000);
      await m.reply(
        alyaHeader("Tunggu Sebentar", "⏳") +
          "\n\n" +
          bracketBox("⏳", "ᴊᴇᴅᴀ", [
            `◦ Tunggu *${sisa} detik* sebelum menyerang lagi.`,
            "◦ Beri kesempatan anggota lain.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Raid adalah kerja sama, bukan lomba spam"),
      );
      return { handled: true };
    }

    if (p.stamina < BIAYA_STAMINA) {
      await m.reply(
        alyaHeader("Stamina Habis", "😮‍💨") +
          "\n\n" +
          bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
            `◦ Punya: *${p.stamina}/${STAMINA_MAKS}*`,
            `◦ Dibutuhkan: *${BIAYA_STAMINA}*`,
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

    // Tiga serangan beruntun per giliran
    let totalDmg = 0;
    let adaKritis = false;
    for (let i = 0; i < 3; i++) {
      const s = hitungSerangan(p, Math.floor(aktif.serang * 0.3));
      totalDmg += s.damage;
      if (s.kritis) adaKritis = true;
    }

    const hpBos = Math.max(0, aktif.hp - totalDmg);

    // Bos membalas
    const balas = Math.max(
      1,
      Math.floor(aktif.serang * (0.5 + Math.random() * 0.5) - kekuatanBela(p) * 0.4),
    );
    const hpPemain = Math.max(0, p.hp - balas);

    const peserta = { ...(aktif.peserta || {}) };
    peserta[aku] = (peserta[aku] || 0) + totalDmg;
    const jeda = { ...(aktif.jeda || {}) };
    jeda[aku] = Date.now();

    simpanPemain(db, m.sender, { hp: hpPemain });

    /* --- bos tumbang --- */
    if (hpBos <= 0) {
      writeGroupState(db, KEY, m.chat, null);

      const totalDmgSemua = Object.values(peserta).reduce((a, b) => a + b, 0) || 1;
      const daftarHadiah = [];

      for (const [no, dmg] of Object.entries(peserta)) {
        const porsi = dmg / totalDmgSemua;
        const koin = Math.floor(aktif.koin * porsi);
        const exp = Math.floor(aktif.exp * porsi);
        const jid = `${no}@s.whatsapp.net`;
        beriHadiah(db, jid, koin, exp);

        const st = { ...(ambilPemain(db, jid).statistik || {}) };
        st.bosDikalahkan = (st.bosDikalahkan || 0) + 1;
        simpanPemain(db, jid, { statistik: st });

        // Penyumbang terbesar dapat barang langka
        daftarHadiah.push({ no, dmg, koin, exp, porsi });
      }

      daftarHadiah.sort((a, b) => b.dmg - a.dmg);
      if (daftarHadiah[0]) {
        tambahBarang(db, `${daftarHadiah[0].no}@s.whatsapp.net`, "sisik_naga", 1);
      }

      const barisHadiah = daftarHadiah
        .slice(0, 8)
        .map(
          (h, i) =>
            `◦ ${i + 1}. @${h.no} — *${angka(h.koin)}* koin${i === 0 ? " 🐍" : ""}\n│     ${angka(h.dmg)} dmg (${Math.round(h.porsi * 100)}%)`,
        );

      await m.reply(
        alyaHeader("Bos Dikalahkan!", "🏆") +
          "\n\n" +
          bracketBox(aktif.ikon, "ᴛᴜᴍʙᴀɴɢ", [
            `◦ ${aktif.ikon} *${aktif.nama}* berhasil dijatuhkan!`,
            `◦ Pukulan terakhir: @${aku} (*${angka(totalDmg)}* dmg)`,
          ]) +
          "\n\n" +
          bracketBox("💰", "ᴘᴇᴍʙᴀɢɪᴀɴ ʜᴀᴅɪᴀʜ", barisHadiah) +
          "\n\n" +
          bracketBox("🎁", "ʙᴏɴᴜꜱ", [
            `◦ Penyumbang terbesar dapat *Sisik Naga*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}raidbos mulai untuk memanggil bos berikutnya`),
        {
          mentions: [
            ...daftarHadiah.slice(0, 8).map((h) => `${h.no}@s.whatsapp.net`),
            `${aku}@s.whatsapp.net`,
          ],
        },
      );
      return { handled: true };
    }

    /* --- bos masih hidup --- */
    writeGroupState(db, KEY, m.chat, { ...aktif, hp: hpBos, peserta, jeda });

    await m.reply(
      alyaHeader("Serangan Dilancarkan", "⚔️") +
        "\n\n" +
        bracketBox("💥", "ꜱᴇʀᴀɴɢᴀɴᴍᴜ", [
          `◦ ${labelKelas(p.kelas)} Lv${p.level}`,
          `◦ Kerusakan: *${angka(totalDmg)}*${adaKritis ? " 💥 KRITIS!" : ""}`,
          `◦ Total sumbanganmu: *${angka(peserta[aku])}*`,
        ]) +
        "\n\n" +
        bracketBox(aktif.ikon, "ᴋᴏɴᴅɪꜱɪ ʙᴏꜱ", [
          `◦ *${aktif.nama}*`,
          `◦ ${bar(hpBos, aktif.hpMaks, 12)}`,
          `◦ *${angka(hpBos)}/${angka(aktif.hpMaks)}* (${Math.round((hpBos / aktif.hpMaks) * 100)}%)`,
        ]) +
        "\n\n" +
        bracketBox("🩸", "ʙᴀʟᴀꜱᴀɴ ʙᴏꜱ", [
          `◦ Kamu terkena *${angka(balas)}* kerusakan`,
          `◦ HP: ${bar(hpPemain, p.hpMaks, 8)} *${angka(hpPemain)}/${angka(p.hpMaks)}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(
          hpPemain <= 0
            ? `Kamu tumbang! Pakai ${prefix}ramuan`
            : `Ajak anggota lain ketik ${prefix}raidbos`,
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
        tipText(`Ketik ${prefix}raidbos untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { BOS, raidAktif, KEY, DURASI, JEDA_SERANG };
