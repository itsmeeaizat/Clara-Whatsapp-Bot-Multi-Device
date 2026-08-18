/**
 * Duel — pertarungan antar pemain (PvP)
 * ---------------------------------------------------------------
 * Tantang anggota grup lain dengan taruhan koin. Tantangan harus
 * diterima lebih dulu, dan koin baru berpindah setelah duel usai.
 *
 *   .duel @orang 1000    menantang dengan taruhan
 *   .duel terima         menerima tantangan
 *   .duel tolak
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
  beriHadiah,
  progresQuest,
  ambilKoin,
  hitungSerangan,
  kekuatanBela,
  kekuatanSerang,
  nomor,
  bar,
  angka,
  labelKelas,
} from "../../src/lib/clara-rpg-core.js";
import { readGroupState, writeGroupState } from "../../src/lib/clara-group-util.js";

const KEY = "rpgDuel";
const KADALUARSA = 3 * 60 * 1000; // tantangan hangus setelah 3 menit
const TARUHAN_MIN = 100;
const TARUHAN_MAKS = 1_000_000;
const MAKS_RONDE = 15;

/** Parse taruhan: mendukung 10rb, 1.5jt, 50000. */
function parseTaruhan(input) {
  const raw = String(input || "").trim().toLowerCase().replace(/\s/g, "");
  if (!raw) return null;

  const adaSatuan = /(rb|ribu|k|jt|juta)$/.test(raw);
  const titik = (raw.match(/\./g) || []).length;
  let s = raw;

  // Titik ambigu: "50.000" = lima puluh ribu, "1.5jt" = satu setengah juta
  if (adaSatuan && titik === 1 && /\.\d{1,2}(rb|ribu|k|jt|juta)$/.test(raw)) {
    s = raw.replace(".", ",");
  } else if (titik > 0) {
    if (!/^\d{1,3}(\.\d{3})+(rb|ribu|k|jt|juta)?$/.test(raw)) return null;
    s = raw.replace(/\./g, "");
  }

  const cocok = s.match(/^(\d+(?:,\d+)?)(rb|ribu|k|jt|juta)?$/);
  if (!cocok) return null;

  const angkaDasar = parseFloat(cocok[1].replace(",", "."));
  if (!Number.isFinite(angkaDasar) || angkaDasar <= 0) return null;

  const unit = cocok[2] || "";
  const kali =
    unit === "rb" || unit === "ribu" || unit === "k"
      ? 1000
      : unit === "jt" || unit === "juta"
        ? 1_000_000
        : 1;

  const hasil = Math.floor(angkaDasar * kali);
  return hasil > 0 ? hasil : null;
}

/** Simulasikan duel dua pemain. */
function simulasiDuel(a, b, acakFn = Math.random) {
  let hpA = a.hp;
  let hpB = b.hp;
  const belaA = kekuatanBela(a);
  const belaB = kekuatanBela(b);
  const ronde = [];

  for (let i = 1; i <= MAKS_RONDE && hpA > 0 && hpB > 0; i++) {
    const serangA = hitungSerangan(a, belaB, acakFn);
    hpB = Math.max(0, hpB - serangA.damage);

    let serangB = { damage: 0, kritis: false, meleset: true };
    if (hpB > 0) {
      serangB = hitungSerangan(b, belaA, acakFn);
      hpA = Math.max(0, hpA - serangB.damage);
    }

    ronde.push({ ke: i, a: serangA, b: serangB, hpA, hpB });
  }

  // Bila kehabisan ronde, HP tersisa terbanyak yang menang
  let pemenang;
  if (hpA <= 0 && hpB <= 0) pemenang = "seri";
  else if (hpA <= 0) pemenang = "b";
  else if (hpB <= 0) pemenang = "a";
  else if (hpA === hpB) pemenang = "seri";
  else pemenang = hpA > hpB ? "a" : "b";

  return { pemenang, ronde, hpA, hpB };
}

const pluginConfig = {
  name: "duelrpg",
  alias: ["tanding", "tantang", "lawanorang", "pvprpg"],
  category: "game",
  description: "Duel PvP antar pemain grup dengan taruhan koin",
  usage: ".duelrpg @orang <taruhan> | .duelrpg terima | .duelrpg tolak",
  example: ".duelrpg @628xx 5000",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const aku = nomor(m.sender);
    const tersimpan = readGroupState(db, KEY, m.chat, null);
    const aktif =
      tersimpan && Date.now() - tersimpan.dibuat < KADALUARSA ? tersimpan : null;

    /* --- menolak --- */
    if (["tolak", "batal", "no"].includes(sub)) {
      if (!aktif) {
        await m.reply(
          alyaHeader("Tidak Ada Tantangan", "ℹ️") +
            "\n\n" +
            bracketBox("ℹ️", "ɪɴꜰᴏ", ["◦ Tidak ada duel yang menunggu."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}duelrpg @orang 1000 untuk menantang`),
        );
        return { handled: true };
      }
      if (aktif.lawan !== aku && aktif.penantang !== aku) {
        await m.reply(
          alyaHeader("Bukan Duelmu", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ɪɴꜰᴏ", ["◦ Kamu bukan bagian dari duel ini."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Tunggu duel ini selesai"),
        );
        return { handled: true };
      }
      writeGroupState(db, KEY, m.chat, null);
      await m.reply(
        alyaHeader("Duel Dibatalkan", "🏳️") +
          "\n\n" +
          bracketBox("🏳️", "ɪɴꜰᴏ", ["◦ Tantangan dibatalkan.", "◦ Tidak ada koin berpindah."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Lain kali mungkin"),
      );
      return { handled: true };
    }

    /* --- menerima --- */
    if (["terima", "accept", "ok", "gas"].includes(sub)) {
      if (!aktif) {
        await m.reply(
          alyaHeader("Tidak Ada Tantangan", "ℹ️") +
            "\n\n" +
            bracketBox("ℹ️", "ɪɴꜰᴏ", [
              "◦ Tidak ada duel yang menunggu.",
              "◦ Tantangan hangus setelah *3 menit*.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}duelrpg @orang 1000 untuk menantang`),
        );
        return { handled: true };
      }
      if (aktif.lawan !== aku) {
        await m.reply(
          alyaHeader("Bukan Untukmu", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ɪɴꜰᴏ", [
              `◦ Tantangan ini untuk @${aktif.lawan}.`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Tunggu giliranmu"),
          { mentions: [`${aktif.lawan}@s.whatsapp.net`] },
        );
        return { handled: true };
      }

      const jidPenantang = `${aktif.penantang}@s.whatsapp.net`;
      const pA = ambilPemain(db, jidPenantang);
      const pB = ambilPemain(db, m.sender);

      // Periksa ulang koin — bisa saja sudah dipakai sejak tantangan dibuat
      if (pA.koin < aktif.taruhan || pB.koin < aktif.taruhan) {
        writeGroupState(db, KEY, m.chat, null);
        const kurang = pA.koin < aktif.taruhan ? aktif.penantang : aku;
        await m.reply(
          alyaHeader("Koin Tidak Cukup", "💸") +
            "\n\n" +
            bracketBox("💸", "ɪɴꜰᴏ", [
              `◦ @${kurang} tidak punya cukup koin.`,
              `◦ Taruhan: *${angka(aktif.taruhan)}*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Duel dibatalkan, tidak ada koin berpindah"),
          { mentions: [`${kurang}@s.whatsapp.net`] },
        );
        return { handled: true };
      }

      if (pA.hp <= 0 || pB.hp <= 0) {
        writeGroupState(db, KEY, m.chat, null);
        await m.reply(
          alyaHeader("Ada yang Tumbang", "💀") +
            "\n\n" +
            bracketBox("💀", "ɪɴꜰᴏ", [
              "◦ Salah satu petarung HP-nya habis.",
              `◦ Pulihkan dulu dengan *${prefix}ramuan*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Duel dibatalkan"),
        );
        return { handled: true };
      }

      writeGroupState(db, KEY, m.chat, null);
      const hasil = simulasiDuel(pA, pB);

      // Pindahkan koin
      let menang = null;
      let kalah = null;
      if (hasil.pemenang === "a") {
        menang = aktif.penantang;
        kalah = aku;
      } else if (hasil.pemenang === "b") {
        menang = aku;
        kalah = aktif.penantang;
      }

      if (menang) {
        const jidMenang = `${menang}@s.whatsapp.net`;
        const jidKalah = `${kalah}@s.whatsapp.net`;
        // Ambil dari yang kalah dulu, baru berikan ke pemenang
        if (ambilKoin(db, jidKalah, aktif.taruhan)) {
          beriHadiah(db, jidMenang, aktif.taruhan, 60);
        }

        const stM = { ...(ambilPemain(db, jidMenang).statistik || {}) };
        stM.menang = (stM.menang || 0) + 1;
        simpanPemain(db, jidMenang, {
          statistik: stM,
          hp: hasil.pemenang === "a" ? hasil.hpA : hasil.hpB,
        });
        const curP = ambilPemain(db, jidMenang);
        if (curP.questHarian) progresQuest(curP, "duel_1x", 1);

        const stK = { ...(ambilPemain(db, jidKalah).statistik || {}) };
        stK.kalah = (stK.kalah || 0) + 1;
        simpanPemain(db, jidKalah, {
          statistik: stK,
          hp: hasil.pemenang === "a" ? hasil.hpB : hasil.hpA,
        });
      } else {
        simpanPemain(db, jidPenantang, { hp: hasil.hpA });
        simpanPemain(db, m.sender, { hp: hasil.hpB });
      }

      const ringkas = hasil.ronde.slice(-3).map((r) => {
        const kiri = r.a.meleset ? "meleset" : `${r.a.damage}${r.a.kritis ? "💥" : ""}`;
        const kanan = r.b.meleset ? "meleset" : `${r.b.damage}${r.b.kritis ? "💥" : ""}`;
        return `◦ R${r.ke}: ${kiri} ⚔️ ${kanan}`;
      });

      const judul =
        hasil.pemenang === "seri" ? "Duel Imbang" : "Duel Selesai";

      await m.reply(
        alyaHeader(judul, "⚔️") +
          "\n\n" +
          bracketBox("🥊", "ᴘᴇᴛᴀʀᴜɴɢ", [
            `◦ @${aktif.penantang} — ${labelKelas(pA.kelas)} Lv${pA.level}`,
            `◦ HP: ${bar(hasil.hpA, pA.hpMaks, 8)} ${angka(hasil.hpA)}`,
            "│",
            `◦ @${aku} — ${labelKelas(pB.kelas)} Lv${pB.level}`,
            `◦ HP: ${bar(hasil.hpB, pB.hpMaks, 8)} ${angka(hasil.hpB)}`,
          ]) +
          "\n\n" +
          bracketBox("⚔️", "ʀᴏɴᴅᴇ ᴀᴋʜɪʀ", ringkas) +
          "\n\n" +
          bracketBox(menang ? "🏆" : "🤝", "ʜᴀꜱɪʟ", 
            menang
              ? [
                  `◦ Pemenang: *@${menang}*`,
                  `◦ Koin: *+${angka(aktif.taruhan)}*`,
                  `◦ @${kalah} kehilangan *${angka(aktif.taruhan)}*`,
                ]
              : ["◦ *Seri!* Tidak ada koin berpindah.", "◦ Keduanya sama kuat."],
          ) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}duelrpg @orang untuk tanding lagi`),
        {
          mentions: [
            `${aktif.penantang}@s.whatsapp.net`,
            `${aku}@s.whatsapp.net`,
          ],
        },
      );
      return { handled: true };
    }

    /* --- menantang --- */
    const target = (m.mentionedJid || [])[0] || (m.quoted ? m.quoted.sender : null);

    if (!target) {
      await m.reply(
        alyaHeader("Duel PvP", "⚔️") +
          "\n\n" +
          bracketBox("📋", "ᴄᴀʀᴀ ᴍᴀɪɴ", [
            `◦ *${prefix}duelrpg @orang 1000* — menantang`,
            `◦ *${prefix}duelrpg terima* — menerima`,
            `◦ *${prefix}duelrpg tolak* — menolak`,
          ]) +
          "\n\n" +
          bracketBox("💰", "ᴛᴀʀᴜʜᴀɴ", [
            `◦ Minimal *${angka(TARUHAN_MIN)}* koin`,
            `◦ Maksimal *${angka(TARUHAN_MAKS)}* koin`,
            "◦ Format: *1000*, *10rb*, *1.5jt*",
          ]) +
          "\n\n" +
          bracketBox("ℹ️", "ᴀᴛᴜʀᴀɴ", [
            "◦ Tantangan hangus setelah *3 menit*.",
            "◦ Pemenang ditentukan simulasi tempur.",
            "◦ HP yang terkuras ikut tersimpan.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Perkuat senjata dan armor sebelum menantang"),
      );
      return { handled: true };
    }

    const targetNo = nomor(target);

    if (targetNo === aku) {
      await m.reply(
        alyaHeader("Tidak Bisa", "🤨") +
          "\n\n" +
          bracketBox("🤨", "ɪɴꜰᴏ", ["◦ Kamu tidak bisa menantang diri sendiri."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Tantang orang lain di grup ini"),
      );
      return { handled: true };
    }

    if (aktif) {
      await m.reply(
        alyaHeader("Masih Ada Duel", "⏳") +
          "\n\n" +
          bracketBox("⏳", "ɪɴꜰᴏ", [
            `◦ @${aktif.penantang} vs @${aktif.lawan} belum selesai.`,
            "◦ Tunggu, atau biarkan hangus 3 menit.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}duelrpg tolak untuk membatalkan`),
        {
          mentions: [
            `${aktif.penantang}@s.whatsapp.net`,
            `${aktif.lawan}@s.whatsapp.net`,
          ],
        },
      );
      return { handled: true };
    }

    const angkaArg = args.find((a) => /\d/.test(a) && !a.includes("@"));
    const taruhan = parseTaruhan(angkaArg);

    if (!taruhan || taruhan < TARUHAN_MIN || taruhan > TARUHAN_MAKS) {
      await m.reply(
        alyaHeader("Taruhan Salah", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", [
            `◦ Minimal *${angka(TARUHAN_MIN)}*, maksimal *${angka(TARUHAN_MAKS)}*.`,
            `◦ Contoh: *${prefix}duelrpg @orang 5000*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Bisa juga ditulis 5rb atau 1.5jt"),
      );
      return { handled: true };
    }

    const pAku = ambilPemain(db, m.sender);
    if (pAku.koin < taruhan) {
      await m.reply(
        alyaHeader("Koin Kurang", "💸") +
          "\n\n" +
          bracketBox("💸", "ɪɴꜰᴏ", [
            `◦ Koinmu: *${angka(pAku.koin)}*`,
            `◦ Taruhan: *${angka(taruhan)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Cari koin dengan ${prefix}tambangrpg atau ${prefix}bertarung`),
      );
      return { handled: true };
    }

    writeGroupState(db, KEY, m.chat, {
      penantang: aku,
      lawan: targetNo,
      taruhan,
      dibuat: Date.now(),
    });

    const pLawan = ambilPemain(db, `${targetNo}@s.whatsapp.net`);

    await m.reply(
      alyaHeader("Tantangan Duel", "⚔️") +
        "\n\n" +
        bracketBox("🥊", "ᴘᴇɴᴀɴᴛᴀɴɢ", [
          `◦ @${aku} — ${labelKelas(pAku.kelas)} Lv${pAku.level}`,
          `◦ HP: *${angka(pAku.hp)}/${angka(pAku.hpMaks)}* · Serang *${angka(kekuatanSerang(pAku))}*`,
        ]) +
        "\n\n" +
        bracketBox("🎯", "ᴅɪᴛᴀɴᴛᴀɴɢ", [
          `◦ @${targetNo} — ${labelKelas(pLawan.kelas)} Lv${pLawan.level}`,
          `◦ HP: *${angka(pLawan.hp)}/${angka(pLawan.hpMaks)}* · Serang *${angka(kekuatanSerang(pLawan))}*`,
        ]) +
        "\n\n" +
        bracketBox("💰", "ᴛᴀʀᴜʜᴀɴ", [`◦ *${angka(taruhan)} koin*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`@${targetNo} ketik ${prefix}duelrpg terima dalam 3 menit`),
      {
        mentions: [`${aku}@s.whatsapp.net`, `${targetNo}@s.whatsapp.net`],
      },
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}duelrpg untuk panduan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { parseTaruhan, simulasiDuel, KEY, TARUHAN_MIN, TARUHAN_MAKS, KADALUARSA };
