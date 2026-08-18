/**
 * Arena — PVP Arena dengan rating
 * ---------------------------------------------------------------
 *   .arena              lihat status arena
 *   .arena tantang @user  tantang pemain lain
 *   .arena accept       terima tantangan
 *   .arena ranking      leaderboard arena
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
  kekuatanSerang,
  kekuatanBela,
  peluangKritis,
  hitungSerangan,
  bar,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "arena",
  alias: ["pvp", "tanding", "lawa"],
  category: "game",
  description: "Arena PVP — tantang pemain lain, rating sistem",
  usage: ".arena [tantang @user | accept | ranking]",
  example: ".arena",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const COOLDOWN_MS = 5 * 60 * 1000; // 5 menit
const TIMEOUT_MS = 60 * 1000; // 60 detik untuk accept

// In-memory: tantangan aktif per group
// { groupId: { tantanganId: { penantang, lawan, waktu, group } } }
const tantanganAktif = new Map();

function nomor(jid) {
  return String(jid || "").replace(/@.+$/, "").replace(/[^\d]/g, "");
}

function ratingDefault() {
  return 1000;
}

function simulasiTanding(pA, pB) {
  const ronde = [];
  let hpA = pA.hp;
  let hpB = pB.hp;
  let rondeKe = 0;
  const maksRonde = 10;

  while (hpA > 0 && hpB > 0 && rondeKe < maksRonde) {
    rondeKe++;

    // A serang B
    const serangA = hitungSerangan(pA, pB);
    hpB = Math.max(0, hpB - serangA.damage);

    ronde.push({
      ronde: rondeKe,
      penyerang: "A",
      damage: serangA.damage,
      kritis: serangA.kritis,
      hpA: Math.max(0, hpA),
      hpB: Math.max(0, hpB),
    });

    if (hpB <= 0) break;

    // B serang A
    const serangB = hitungSerangan(pB, pA);
    hpA = Math.max(0, hpA - serangB.damage);

    ronde.push({
      ronde: rondeKe,
      penyerang: "B",
      damage: serangB.damage,
      kritis: serangB.kritis,
      hpA: Math.max(0, hpA),
      hpB: Math.max(0, hpB),
    });
  }

  let pemenang;
  if (hpA <= 0 && hpB <= 0) pemenang = "seri";
  else if (hpA <= 0) pemenang = "B";
  else if (hpB <= 0) pemenang = "A";
  else pemenang = hpA > hpB ? "A" : "B";

  return { pemenang, ronde, hpA, hpB };
}

async function handler(m, { sock, config }) {
  const prefix = config?.command?.prefix || ".";
  const db = m?.db || sock?.db;
  if (!db) return { handled: true };

  try {
    const p = ambilPemain(db, m.sender);
    if (!p) {
      await m.reply(
        alyaHeader("Arena", "⚔️") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum terdaftar. Ketik *.petualang* dulu."])
      );
      return { handled: true };
    }

    const teks = (m.text || "").trim().toLowerCase();
    const parts = teks.split(/\s+/);
    const sub = parts[0];
    const groupId = m.chat || m.sender;

    // --- .arena ranking ---
    if (sub === "ranking" || sub === "leaderboard") {
      const { bacaSemua } = await import("../../src/lib/clara-rpg-core.js");
      const semua = bacaSemua(db);
      const daftar = [];

      for (const [id, data] of Object.entries(semua)) {
        const rating = data.arenaRating || 0;
        if (rating > 0) {
          const pemain = ambilPemain(db, `${id}@s.whatsapp.net`);
          daftar.push({
            nama: pemain.nama || "Petualang",
            rating,
            level: pemain.level,
            menang: data.arenaMenang || 0,
            kalah: data.arenaKalah || 0,
          });
        }
      }

      daftar.sort((a, b) => b.rating - a.rating);

      if (daftar.length === 0) {
        await m.reply(
          alyaHeader("Arena Ranking", "🏆") +
            "\n\n" +
            bracketBox("🏆", "ʀᴀɴᴋɪɴɢ", ["◦ Belum ada pemain dengan rating arena."]) +
            "\n\n" +
            tipText(`Mulai bertarung: ${prefix}arena tantang @user`)
        );
        return { handled: true };
      }

      const top = daftar.slice(0, 10);
      const lines = top.map((d, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        return `${medal} *${d.nama}* — ${angka(d.rating)} rating (${d.menang}M/${d.kalah}K)`;
      });

      await m.reply(
        alyaHeader("Arena Ranking", "🏆") +
          "\n\n" +
          bracketBox("🏆", "ᴛᴏᴘ ᴘᴠᴘ", lines) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ratingmu: ${p.arenaRating || ratingDefault()}`)
      );
      return { handled: true };
    }

    // --- .arena tantang @user ---
    if (sub === "tantang" || sub === "challenge") {
      // Cek cooldown
      const cooldownAt = (p.arenaCooldown || 0);
      if (Date.now() - cooldownAt < COOLDOWN_MS) {
        const sisa = Math.ceil((COOLDOWN_MS - (Date.now() - cooldownAt)) / 1000);
        await m.reply(
          alyaHeader("Cooldown", "⏰") +
            "\n\n" +
            bracketBox("⏰", "ɪɴꜰᴏ", [`◦ Tunggu *${sisa} detik* sebelum tantang lagi.`])
        );
        return { handled: true };
      }

      // Cari @mention
      const mentions = m.mentionedJid || m.mentions || [];
      if (mentions.length === 0) {
        // Coba parse dari teks
        const match = (m.text || "").match(/@(\d+)/);
        if (match) {
          mentions.push(`${match[1]}@s.whatsapp.net`);
        }
      }

      if (mentions.length === 0) {
        await m.reply(
          alyaHeader("Arena", "⚔️") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Format: *${prefix}arena tantang @user*`,
              "◦ Tag pemain yang ingin ditantang.",
            ])
        );
        return { handled: true };
      }

      const lawanJid = mentions[0];
      if (nomor(lawanJid) === nomor(m.sender)) {
        await m.reply(
          alyaHeader("Arena", "⚔️") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Tidak bisa tantang diri sendiri!"])
        );
        return { handled: true };
      }

      // Cek lawan terdaftar
      const lawan = ambilPemain(db, lawanJid);
      if (!lawan) {
        await m.reply(
          alyaHeader("Arena", "⚔️") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Lawan belum terdaftar di RPG."])
        );
        return { handled: true };
      }

      // Simpan tantangan
      if (!tantanganAktif.has(groupId)) {
        tantanganAktif.set(groupId, new Map());
      }
      const groupTantangan = tantanganAktif.get(groupId);
      const tantanganId = nomor(m.sender);

      groupTantangan.set(tantanganId, {
        penantang: m.sender,
        lawan: lawanJid,
        waktu: Date.now(),
        group: groupId,
      });

      // Auto-expire setelah 60 detik
      setTimeout(() => {
        const g = tantanganAktif.get(groupId);
        if (g && g.has(tantanganId)) {
          g.delete(tantanganId);
        }
      }, TIMEOUT_MS);

      await m.reply(
        alyaHeader("Tantangan Arena! ⚔️", "🤺") +
          "\n\n" +
          bracketBox("⚔️", "ᴛᴀɴᴛᴀɴɢᴀɴ", [
            `◦ ${p.nama} menantang *${lawan.nama}*!`,
            `◦ Level: *${p.level}* vs *${lawan.level}*`,
            `◦ Rating: *${p.arenaRating || ratingDefault()}* vs *${lawan.arenaRating || ratingDefault()}*`,
            "",
            `◦ Lawan, ketik: *${prefix}arena accept*`,
            `◦ Waktu: *60 detik*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Taruhan: 10% koin dari yang kalah`),
        { mentions: [lawanJid] }
      );
      return { handled: true };
    }

    // --- .arena accept ---
    if (sub === "accept" || sub === "terima") {
      if (!tantanganAktif.has(groupId)) {
        await m.reply(
          alyaHeader("Arena", "⚔️") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Tidak ada tantangan untukmu."])
        );
        return { handled: true };
      }

      const groupTantangan = tantanganAktif.get(groupId);
      const myNomor = nomor(m.sender);

      // Cari tantangan ke aku
      let tantangan = null;
      let tantanganId = null;
      for (const [id, t] of groupTantangan.entries()) {
        if (nomor(t.lawan) === myNomor) {
          tantangan = t;
          tantanganId = id;
          break;
        }
      }

      if (!tantangan) {
        await m.reply(
          alyaHeader("Arena", "⚔️") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Tidak ada tantangan untukmu."])
        );
        return { handled: true };
      }

      // Cek timeout
      if (Date.now() - tantangan.waktu > TIMEOUT_MS) {
        groupTantangan.delete(tantanganId);
        await m.reply(
          alyaHeader("Tantangan Kedaluwarsa", "⏰") +
            "\n\n" +
            bracketBox("⏰", "ɪɴꜰᴏ", ["◦ Tantangan sudah kedaluwarsa (>60 detik)."])
        );
        return { handled: true };
      }

      // Ambil data pemain
      const pemainA = ambilPemain(db, tantangan.penantang);
      const pemainB = ambilPemain(db, m.sender);

      if (!pemainA || !pemainB) {
        groupTantangan.delete(tantanganId);
        await m.reply(
          alyaHeader("Arena", "⚔️") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", ["◦ Salah satu pemain tidak terdaftar."])
        );
        return { handled: true };
      }

      // Simulasi tanding
      const hasil = simulasiTanding(
        { ...pemainA, hp: pemainA.hp || pemainA.hpMaks },
        { ...pemainB, hp: pemainB.hp || pemainB.hpMaks }
      );

      // Hapus tantangan
      groupTantangan.delete(tantanganId);

      // Taruhan: 10% koin dari kalah
      const jidMenang = hasil.pemenang === "A" ? tantangan.penantang : hasil.pemenang === "B" ? m.sender : null;
      const jidKalah = hasil.pemenang === "A" ? m.sender : hasil.pemenang === "B" ? tantangan.penantang : null;

      let taruhan = 0;
      if (jidMenang && jidKalah) {
        const kalahPemain = ambilPemain(db, jidKalah);
        taruhan = Math.floor((kalahPemain.koin || 0) * 0.1);
        if (taruhan > 0) {
          if (ambilKoin(db, jidKalah, taruhan)) {
            beriHadiah(db, jidMenang, taruhan, 0);
          }
        }
      }

      // Update rating
      const ratingA = pemainA.arenaRating || ratingDefault();
      const ratingB = pemainB.arenaRating || ratingDefault();

      let ratingABaru = ratingA;
      let ratingBBaru = ratingB;
      let menangA = pemainA.arenaMenang || 0;
      let kalahA = pemainA.arenaKalah || 0;
      let menangB = pemainB.arenaMenang || 0;
      let kalahB = pemainB.arenaKalah || 0;

      if (hasil.pemenang === "A") {
        ratingABaru = ratingA + 25;
        ratingBBaru = Math.max(0, ratingB - 20);
        menangA++;
        kalahB++;
      } else if (hasil.pemenang === "B") {
        ratingBBaru = ratingB + 25;
        ratingABaru = Math.max(0, ratingA - 20);
        menangB++;
        kalahA++;
      }

      simpanPemain(db, tantangan.penantang, {
        arenaRating: ratingABaru,
        arenaMenang: menangA,
        arenaKalah: kalahA,
        arenaCooldown: Date.now(),
        hp: hasil.hpA,
      });
      simpanPemain(db, m.sender, {
        arenaRating: ratingBBaru,
        arenaMenang: menangB,
        arenaKalah: kalahB,
        arenaCooldown: Date.now(),
        hp: hasil.hpB,
      });

      // Tampilkan hasil
      const rondeLines = [];
      for (const r of hasil.ronde) {
        const penyerang = r.penyerang === "A" ? pemainA.nama : pemainB.nama;
        const kritis = r.kritis ? " 💥KRITIS!" : "";
        rondeLines.push(
          `R${r.ronde}: ${penyerang.slice(0, 10)} — *${r.damage} dmg*${kritis} (HP: ${r.hpA}/${r.hpB})`
        );
      }

      const pemenangNama = hasil.pemenang === "A" ? pemainA.nama : hasil.pemenang === "B" ? pemainB.nama : "Seri";
      const ikon = hasil.pemenang === "seri" ? "🤝" : "🏆";

      await m.reply(
        alyaHeader("Arena PVP " + ikon, "⚔️") +
          "\n\n" +
          bracketBox("⚔️", "ᴘᴇᴍᴀᴛᴄʜ", [
            `◦ ${pemainA.nama} (Lv.${pemainA.level}) vs ${pemainB.nama} (Lv.${pemainB.level})`,
            `◦ Pemenang: *${ikon} ${pemenangNama}*`,
          ]) +
          "\n\n" +
          bracketBox("📜", "ʀᴏɴᴅᴇ", rondeLines.slice(0, 10)) +
          (taruhan > 0
            ? "\n\n" +
              bracketBox("💰", "ᴛᴀʀᴜʜᴀɴ", [`◦ Pemenang dapat *+${angka(taruhan)} koin*`])
            : "") +
          "\n\n" +
          bracketBox("🏆", "ʀᴀᴛɪɴɢ", [
            `◦ ${pemainA.nama}: ${ratingA} → *${ratingABaru}*`,
            `◦ ${pemainB.nama}: ${ratingB} → *${ratingBBaru}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Cooldown 5 menit sebelum tantang lagi`)
      );
      return { handled: true };
    }

    // --- .arena (status) ---
    const rating = p.arenaRating || ratingDefault();
    const menang = p.arenaMenang || 0;
    const kalah = p.arenaKalah || 0;
    const total = menang + kalah;
    const wr = total > 0 ? Math.round((menang / total) * 100) : 0;

    // Cek tantangan pending
    let pending = 0;
    if (tantanganAktif.has(groupId)) {
      const g = tantanganAktif.get(groupId);
      for (const [, t] of g.entries()) {
        if (nomor(t.lawan) === nomor(m.sender)) pending++;
      }
    }

    await m.reply(
      alyaHeader("Arena PVP", "⚔️") +
        "\n\n" +
        bracketBox("⚔️", "ᴘʀᴏꜰɪʟᴇ ᴀʀᴇɴᴀ", [
          `◦ Nama: *${p.nama}*`,
          `◦ Level: *${p.level}*`,
          `◦ Rating: *${angka(rating)}*`,
          `◦ Win/Lose: *${menang}M / ${kalah}K* (${wr}% WR)`,
        ]) +
        (pending > 0
          ? "\n\n" +
            bracketBox("🔔", "ᴛᴀɴᴛᴀɴɢᴀɴ ᴍᴀꜱᴜᴋ", [
              `◦ *${pending}* tantangan menunggu!`,
              `◦ Ketik: *${prefix}arena accept*`,
            ])
          : "") +
        "\n\n" +
        bracketBox("🎯", "ᴀᴋꜱɪ", [
          `◦ Tantang: *${prefix}arena tantang @user*`,
          `◦ Ranking: *${prefix}arena ranking*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Taruhan: 10% koin dari yang kalah")
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
