// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Marriage System — Sistem Pernikahan Modern
 * ---------------------------------------------------------------
 * Fitur nikah untuk couple yang sudah jadian (pacaran).
 * - Hanya bisa nikah kalau sudah jadian via romance system
 * - Lamaran (proposal) → partner terima/tolak
 * - Data nikah tersimpan di database (tanggal, anniversary)
 * - Anniversary reminder & counter
 * - Cerai dengan konfirmasi
 * - Marriage certificate (visual)
 * - Marriage stats
 *
 * Commands:
 * .lamar @user        — Lamar pasanganmu (harus sudah jadian)
 * .jawablamar          — Terima lamaran (reply pesan lamaran)
 * .jawablamar tolak    — Tolak lamaran
 * .nikah               — Alias .lamar (harus sudah jadian)
 * .cerai @user         — Ajukan cerai dari pasangan
 * .statusnikah         — Lihat status pernikahan
 * .anniversary         — Lihat anniversary pernikahan
 * .listnikah           — Daftar couple menikah di grup
 * .marriagestats       — Stats pernikahan kamu
 */

import config from "../../config.js";
import { getDatabase } from "../../src/lib/clara-database.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

// ===================== STATE (in-memory pending proposals) =====================

// Key: targetJid -> { from, timestamp, expiresAt }
const pendingMarriages = new Map();

// ===================== HELPERS =====================

function getDb() {
  try {
    return getDatabase();
  } catch (e) {
    return null;
  }
}

function getUserData(jid) {
  const db = getDb();
  if (!db) return null;
  let user = db.getUser(jid);
  if (!user) {
    user = { romance: null, marriage: null, marriageStats: { proposals: 0, married: 0, divorced: 0 } };
    db.setUser(jid, user);
  }
  return user;
}

function saveUserData(jid, data) {
  const db = getDb();
  if (!db) return;
  db.setUser(jid, data);
  if (typeof db.save === "function") db.save();
}

function getFullData(jid) {
  const user = getUserData(jid);
  if (!user) return null;
  if (!user.romance) user.romance = null;
  if (!user.marriage) user.marriage = null;
  if (!user.marriageStats) user.marriageStats = { proposals: 0, married: 0, divorced: 0 };
  if (!user.romanceStats) user.romanceStats = { proposals: 0, accepted: 0, rejected: 0, breakups: 0 };
  return user;
}

function isCoupled(jid) {
  const user = getFullData(jid);
  return user && user.romance && user.romance.partner;
}

function getPartner(jid) {
  const user = getFullData(jid);
  return user && user.romance ? user.romance.partner : null;
}

function isMarried(jid) {
  const user = getFullData(jid);
  return user && user.marriage && user.marriage.partner;
}

function getSpouse(jid) {
  const user = getFullData(jid);
  return user && user.marriage ? user.marriage.partner : null;
}

function formatDuration(ms) {
  if (!ms) return "-";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return days + " hari " + hours + " jam";
  if (hours > 0) return hours + " jam " + mins + " menit";
  return mins + " menit";
}

function formatDate(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ===================== MARRIAGE MESSAGES =====================

const PROPOSAL_LINES = [
  "Kita sudah bersama cukup lama, dan aku merasa kamu adalah orang yang tepat. Maukah kamu menikah denganku? 💍",
  "Setiap hari bersamamu adalah anugerah. Aku ingin menghabiskan sisa hidupku denganmu. Menikahlah dengan aku? 💒",
  "Aku bukan orang sempurna, tapi aku berjanji akan menjadi pasangan yang baik untukmu. Mau nikah sama aku? 💍✨",
  "Dari pacaran sampai ke pelaminan, itu impianku denganmu. Maukah kamu jadi pendamping hidupku? 💕💒",
  "Aku ingin kita resmi di mata Tuhan dan manusia. Menikahlah denganku, sayang 💍🙏",
];

const ACCEPT_LINES = [
  "Ya, aku mau! Aku sudah lama menunggu momen ini. Bismillah, kita resmi menikah! 💍🤍",
  "Tentu saja mau! Aku tidak bisa membayangkan hidup tanpamu. Kita resmi jadi suami istri! 💒💕",
  "Aku terima lamaranmu dengan sepenuh hati. Semoga kita langgeng sampai kakek nenek 🤗💍",
  "Tanpa ragu, aku katakan YA! Kita resmi menikah hari ini! 🎉💒",
  "Akhirnya kamu melamar juga! Aku mau, aku mau, aku mau! 💍😍",
];

const REJECT_LINES = [
  "Maaf sayang... aku merasa kita butuh lebih banyak waktu. Belum siap menikah sekarang 🥺",
  "Aku sayang kamu, tapi pernikahan adalah langkah besar. Bisa kita tunggu dulu? 🌸",
  "Maaf, aku belum siap secara mental dan finansial untuk menikah. Kasih aku waktu ya 💭",
  "Aku hargai lamaranmu, tapi aku merasa kita perlu lebih mengenal satu sama lain lagi 🌱",
  "Bukan karena aku gak sayang, tapi aku belum siap. Maaf ya 💔",
];

const DIVORCE_LINES = [
  "Maaf, aku rasa pernikahan kita sudah tidak bisa dilanjutkan. Semoga kamu bahagia di tempat lain 💔",
  "Kita sudah berusaha, tapi mungkin memang kita bukan untuk satu sama lain. Cerai ya 🥀",
  "Aku minta maaf atas semua kesalahanku. Mariakhiri dengan baik 🙏",
  "Dengan berat hati, aku ajukan cerai. Semoga kita sama-sama bahagia 💔",
  "Pernikahan ini sudah tidak sehat untuk kita berdua. Saatnya berpisah 🍂",
];

// ===================== HANDLER =====================

async function handler(m, { sock, db: dbArg, groupMetadata }) {
  const command = m.command;
  const args = (m.text || "").trim();
  const sender = m.sender;
  const isGroup = m.chat?.endsWith("@g.us");

  // ===================== LAMAR / NIKAH =====================
  if (command === "lamar" || command === "nikah" || command === "melamar") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    // Harus sudah jadian dulu
    if (!isCoupled(sender)) {
      return m.reply("💔 Kamu belum jadian sama siapapun!\n\nKetik .nembak @user dulu untuk mulai pacaran, lalu .lamar untuk menikah.");
    }

    const partner = getPartner(sender);
    const target = m.mentionedJid?.[0] || m.quoted?.sender || partner;

    // Pastikan lamar ke pasangan yang benar
    if (target !== partner) {
      return m.reply("❌ Kamu hanya bisa melamar pasanganmu sendiri!\n\nPasanganmu: @" + partner.split("@")[0] + "\n\nKetik: .lamar @" + partner.split("@")[0], { mentions: [partner] });
    }

    // Cek apakah sudah menikah
    if (isMarried(sender)) {
      const spouse = getSpouse(sender);
      return m.reply("💍 Kamu sudah menikah sama @" + spouse.split("@")[0] + "!\n\nKetik .cerai dulu kalau mau... 😔", { mentions: [spouse] });
    }

    // Cek pending lamaran
    const existing = pendingMarriages.get(partner);
    if (existing && existing.from === sender) {
      return m.reply("⏳ Kamu sudah melamar @" + partner.split("@")[0] + "! Tunggu jawabannya ya.\n\nLamaran expire dalam 24 jam.", { mentions: [partner] });
    }

    // Auto-accept kalau saling lamar
    const reverseProposal = pendingMarriages.get(sender);
    if (reverseProposal && reverseProposal.from === partner) {
      pendingMarriages.delete(sender);
      pendingMarriages.delete(partner);

      const now = Date.now();
      const senderUser = getFullData(sender);
      const partnerUser = getFullData(partner);

      senderUser.marriage = { partner: partner, since: now, group: m.chat, proposedBy: sender };
      senderUser.marriageStats.married = (senderUser.marriageStats.married || 0) + 1;
      saveUserData(sender, senderUser);

      partnerUser.marriage = { partner: sender, since: now, group: m.chat, proposedBy: partner };
      partnerUser.marriageStats.married = (partnerUser.marriageStats.married || 0) + 1;
      saveUserData(partner, partnerUser);

      const line = pickRandom(ACCEPT_LINES);
      let text = alyaHeader("Auto-Marriage! 💒✨", "💍") + "\n\n";
      text += "╔═══════════════════════════════╗\n";
      text += "║    💍 SURAT NIKAH DIGITAL 💍    ║\n";
      text += "╚═══════════════════════════════╝\n\n";
      text += bracketBox("💒", "ᴀᴋᴀᴅ ɴɪᴋᴀʜ", [
        "◦ Suami: @" + sender.split("@")[0],
        "◦ Istri: @" + partner.split("@")[0],
        "◦ Status: *Resmi Menikah!* 💍",
        "◦ Tanggal: " + formatDate(now),
        "",
        "💌 \"" + line + "\"",
        "",
        "🔥 Bismillah, semoga langgeng sampai jannah!",
      ]) + "\n\n" + separator() + "\n" + tipText("Selamat menempuh hidup baru! 🎉💍");

      return m.reply(text, { mentions: [sender, partner] });
    }

    // Buat lamaran baru
    const proposalMsg = pickRandom(PROPOSAL_LINES);
    pendingMarriages.set(partner, {
      from: sender,
      message: proposalMsg,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Update stats
    const senderUser = getFullData(sender);
    senderUser.marriageStats.proposals = (senderUser.marriageStats.proposals || 0) + 1;
    saveUserData(sender, senderUser);

    let text = alyaHeader("Lamaran Terkirim 💍", "💒") + "\n\n";
    text += bracketBox("💍", "ʟᴀᴍᴀʀᴀɴ", [
      "◦ Dari: @" + sender.split("@")[0],
      "◦ Untuk: @" + partner.split("@")[0],
      "◦ Status: *Menunggu Jawaban*",
      "",
      "💌 \"" + proposalMsg + "\"",
      "",
      "⏳ Expire dalam 24 jam",
    ]) + "\n\n" + separator() + "\n" + tipText("@" + partner.split("@")[0] + " ketik .jawablamar untuk terima atau .jawablamar tolak untuk menolak!");

    return m.reply(text, { mentions: [sender, partner] });
  }

  // ===================== JAWAB LAMAR =====================
  if (command === "jawablamar" || command === "terimalamar" || command === "jawabnikah") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    const proposal = pendingMarriages.get(sender);
    if (!proposal) return m.reply("📭 Tidak ada lamaran yang menunggu jawabanmu.");

    // Cek expiry
    if (Date.now() > proposal.expiresAt) {
      pendingMarriages.delete(sender);
      return m.reply("⏰ Lamaran sudah expire (lebih dari 24 jam).");
    }

    const proposer = proposal.from;
    const action = args.toLowerCase();

    // Cek apakah masih jadian
    if (!isCoupled(sender) || getPartner(sender) !== proposer) {
      pendingMarriages.delete(sender);
      return m.reply("❌ Kamu sudah tidak jadian dengan @" + proposer.split("@")[0] + "!\nLamaran dibatalkan.", { mentions: [proposer] });
    }

    // Cek sudah menikah
    if (isMarried(sender) || isMarried(proposer)) {
      pendingMarriages.delete(sender);
      return m.reply("💍 Salah satu sudah menikah! Lamaran dibatalkan.");
    }

    // TOLAK
    if (action === "tolak" || action === "no" || action === "tidak") {
      pendingMarriages.delete(sender);

      const senderUser = getFullData(sender);
      saveUserData(sender, senderUser);

      const line = pickRandom(REJECT_LINES);
      let text = alyaHeader("Lamaran Ditolak 💔", "🥀") + "\n\n";
      text += bracketBox("💔", "ʜᴀsɪʟ", [
        "◦ @" + sender.split("@")[0] + " menolak lamaran @" + proposer.split("@")[0],
        "◦ Status: *Lamaran Ditolak*",
        "",
        "💬 \"" + line + "\"",
      ]) + "\n\n" + separator() + "\n" + tipText("Sabar ya, mungkin belum rezeki jodoh 🙏");

      return m.reply(text, { mentions: [sender, proposer] });
    }

    // TERIMA (default)
    pendingMarriages.delete(sender);
    const now = Date.now();

    const senderUser = getFullData(sender);
    senderUser.marriage = { partner: proposer, since: now, group: m.chat, proposedBy: proposer };
    senderUser.marriageStats.married = (senderUser.marriageStats.married || 0) + 1;
    saveUserData(sender, senderUser);

    const proposerUser = getFullData(proposer);
    proposerUser.marriage = { partner: sender, since: now, group: m.chat, proposedBy: proposer };
    proposerUser.marriageStats.married = (proposerUser.marriageStats.married || 0) + 1;
    saveUserData(proposer, proposerUser);

    const line = pickRandom(ACCEPT_LINES);
    let text = alyaHeader("Pernikahan Resmi! 💍", "💒") + "\n\n";
    text += "╔═══════════════════════════════╗\n";
    text += "║    💍 SURAT NIKAH DIGITAL 💍    ║\n";
    text += "╚═══════════════════════════════╝\n\n";
    text += bracketBox("💒", "ᴀᴋᴀᴅ ɴɪᴋᴀʜ", [
      "◦ Suami: @" + proposer.split("@")[0],
      "◦ Istri: @" + sender.split("@")[0],
      "◦ Status: *Resmi Menikah!* 💍",
      "◦ Tanggal: " + formatDate(now),
      "◦ Pacaran sejak: " + formatDate(senderUser.romance?.since),
      "",
      "💌 \"" + line + "\"",
      "",
      "🔥 Bismillah, semoga langgeng sampai jannah!",
    ]) + "\n\n" + separator() + "\n" + tipText("Selamat menempuh hidup baru! 🎉💍");

    return m.reply(text, { mentions: [sender, proposer] });
  }

  // ===================== CERAI =====================
  if (command === "cerai" || command === "divorce" || command === "pisah") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    if (!isMarried(sender)) return m.reply("💔 Kamu belum menikah sama siapapun.");

    const spouse = getSpouse(sender);
    const reason = args.replace(/@\d+/g, "").trim() || "Tanpa alasan";

    // Update both users
    const senderUser = getFullData(sender);
    const marriageDuration = senderUser.marriage.since ? Date.now() - senderUser.marriage.since : 0;
    senderUser.marriage = null;
    senderUser.marriageStats.divorced = (senderUser.marriageStats.divorced || 0) + 1;
    saveUserData(sender, senderUser);

    const spouseUser = getFullData(spouse);
    if (spouseUser) {
      spouseUser.marriage = null;
      spouseUser.marriageStats.divorced = (spouseUser.marriageStats.divorced || 0) + 1;
      saveUserData(spouse, spouseUser);
    }

    const line = pickRandom(DIVORCE_LINES);
    let text = alyaHeader("Perceraian 💔", "🍂") + "\n\n";
    text += bracketBox("💔", "ᴘᴇʀᴄᴇʀᴀɪᴀɴ", [
      "◦ @" + sender.split("@")[0] + " 💍💔 @" + spouse.split("@")[0],
      "◦ Status: *Cerai*",
      "◦ Durasi Pernikahan: " + formatDuration(marriageDuration),
      "◦ Alasan: " + reason,
      "",
      "💬 \"" + line + "\"",
    ]) + "\n\n" + separator() + "\n" + tipText("Semoga kalian menemukan kebahagiaan masing-masing 🙏");

    return m.reply(text, { mentions: [sender, spouse] });
  }

  // ===================== STATUS NIKAH =====================
  if (command === "statusnikah" || command === "nikahstatus" || command === "statuspernikahan") {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || sender;
    const targetName = target === sender ? "Kamu" : (m.pushName || "@" + target.split("@")[0]);

    if (!isMarried(target)) {
      const coupled = isCoupled(target);
      let text = alyaHeader("Status Pernikahan 💍", "💔") + "\n\n";
      text += bracketBox("📋", "ꜱᴛᴀᴛᴜꜱ", [
        "◦ " + targetName + ": " + (coupled ? "Pacaran 💑" : "Single 🎶"),
        "◦ Status Nikah: *Belum Menikah*",
      ]) + "\n\n" + separator() + "\n" + tipText(coupled ? "Sudah siap ke pelaminan? .lamar @" + (getPartner(target) || "").split("@")[0] + " 💍" : "Cari jodoh dulu dengan .nembak @user 🌹");
      return m.reply(text, { mentions: coupled ? [target, getPartner(target)] : (target !== sender ? [target] : []) });
    }

    const spouse = getSpouse(target);
    const marriage = getFullData(target).marriage;
    const duration = Date.now() - marriage.since;
    const days = Math.floor(duration / 86400000);

    // Cek anniversary
    const now = new Date();
    const marriageDate = new Date(marriage.since);
    const nextAnniv = new Date(now.getFullYear(), marriageDate.getMonth(), marriageDate.getDate());
    if (nextAnniv < now) nextAnniv.setFullYear(now.getFullYear() + 1);
    const daysToAnniv = Math.ceil((nextAnniv - now) / 86400000);

    let text = alyaHeader("Status Pernikahan 💍", "💒") + "\n\n";
    text += bracketBox("💍", "ᴘᴇʀɴɪᴋᴀʜᴀɴ", [
      "◦ " + targetName + " 💍 @" + spouse.split("@")[0],
      "◦ Status: *Menikah* 💍",
      "◦ Tanggal Nikah: " + formatDate(marriage.since),
      "◦ Durasi: " + formatDuration(duration),
      "◦ Hari ke: *" + days + "*",
      "◦ Anniversary berikutnya: *" + daysToAnniv + " hari lagi* 🎂",
    ]) + "\n\n" + separator() + "\n" + tipText(days < 30 ? "Masih pengantin baru! 🌹" : days < 365 ? "Pernikahan stabil! 👏" : "Pernikahan langgeng! 🏆");

    return m.reply(text, { mentions: [target, spouse] });
  }

  // ===================== ANNIVERSARY =====================
  if (command === "anniversary" || command === "anniv" || command === "ulangtahunnikah") {
    if (!isMarried(sender)) return m.reply("💔 Kamu belum menikah!");

    const spouse = getSpouse(sender);
    const marriage = getFullData(sender).marriage;
    const marriageDate = new Date(marriage.since);
    const now = new Date();

    // Hitung anniversary
    let yearsMarried = now.getFullYear() - marriageDate.getFullYear();
    let nextAnniv = new Date(now.getFullYear(), marriageDate.getMonth(), marriageDate.getDate());
    if (nextAnniv < now) {
      nextAnniv.setFullYear(now.getFullYear() + 1);
    } else {
      yearsMarried--;
    }
    const daysToAnniv = Math.ceil((nextAnniv - now) / 86400000);
    const totalDays = Math.floor((now - marriageDate) / 86400000);

    let text = alyaHeader("Anniversary 💍", "🎂") + "\n\n";
    text += bracketBox("🎉", "ᴀɴɴɪᴠᴇʀꜱᴀʀʏ", [
      "◦ Pasangan: @" + sender.split("@")[0] + " 💍 @" + spouse.split("@")[0],
      "◦ Tanggal Nikah: " + formatDate(marriage.since),
      "◦ Tahun ke: *" + (yearsMarried + 1) + "* 🎂",
      "◦ Total hari: *" + totalDays + "*",
      "◦ Anniversary berikutnya: " + formatDate(nextAnniv.getTime()),
      "◦ Dalam: *" + daysToAnniv + " hari lagi*",
    ]);

    if (daysToAnniv <= 7 && daysToAnniv > 0) {
      text += "\n\n" + bracketBox("🔔", "ᴘᴇʀɪɴɢᴀᴛ", [
        "🎉 Anniversary kamu sebentar lagi!",
        "Jangan lupa kasih hadiah @" + spouse.split("@")[0] + " 🎁",
      ]);
    }

    text += "\n\n" + separator() + "\n" + tipText("Semoga pernikahan kalian langgeng sampai jannah 🤲");

    return m.reply(text, { mentions: [sender, spouse] });
  }

  // ===================== LIST NIKAH =====================
  if (command === "listnikah" || command === "daftarnikah" || command === "listmarried") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    const meta = groupMetadata || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return m.reply("❌ Gagal mendapatkan info grup.");

    const married = [];
    const checked = new Set();

    for (const p of meta.participants) {
      const jid = p.id;
      if (checked.has(jid)) continue;
      if (isMarried(jid)) {
        const spouse = getSpouse(jid);
        if (spouse && !checked.has(spouse)) {
          const marriage = getFullData(jid).marriage;
          const days = Math.floor((Date.now() - marriage.since) / 86400000);
          married.push({
            a: jid,
            b: spouse,
            since: marriage.since,
            days,
          });
          checked.add(jid);
          checked.add(spouse);
        }
      }
    }

    if (married.length === 0) {
      let text = alyaHeader("Daftar Pernikahan 💍", "💔") + "\n\n";
      text += "Belum ada pasangan menikah di grup ini.\n\n" + separator() + "\n" + tipText("Jadi yang pertama! .lamar @pasangan 💒");
      return m.reply(text);
    }

    married.sort((a, b) => b.days - a.days);

    let text = alyaHeader("Daftar Pernikahan 💍", "💒") + "\n\n";
    text += "Total: *" + married.length + "* pasangan menikah\n\n";

    const mentions = [];
    for (let i = 0; i < married.length; i++) {
      const c = married[i];
      mentions.push(c.a, c.b);
      let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + ".";
      text += medal + " @" + c.a.split("@")[0] + " 💍 @" + c.b.split("@")[0] + "\n";
      text += "   💒 " + c.days + " hari (" + formatDate(c.since) + ")\n\n";
    }

    text += separator() + "\n" + tipText("Pernikahan terlama: @" + married[0].a.split("@")[0] + " & @" + married[0].b.split("@")[0] + " 🏆");
    return m.reply(text, { mentions });
  }

  // ===================== MARRIAGE STATS =====================
  if (command === "marriagestats" || command === "statsnikah") {
    const target = m.mentionedJid?.[0] || sender;
    const user = getFullData(target);
    if (!user) return m.reply("❌ Data tidak ditemukan.");

    const stats = user.marriageStats || { proposals: 0, married: 0, divorced: 0 };
    const romanceStats = user.romanceStats || { proposals: 0, accepted: 0, rejected: 0, breakups: 0 };

    let text = alyaHeader("Marriage Stats 📊", "💍") + "\n\n";
    text += bracketBox("📈", "ꜱᴛᴀᴛɪꜱᴛɪᴋ ᴘᴇʀɴɪᴋᴀʜᴀɴ", [
      "◦ Status: " + (isMarried(target) ? "Menikah 💍" : isCoupled(target) ? "Pacaran 💑" : "Single 🎶"),
      "◦ Total Lamar: *" + (stats.proposals || 0) + "*",
      "◦ Menikah: *" + (stats.married || 0) + "* 💍",
      "◦ Cerai: *" + (stats.divorced || 0) + "* 💔",
      "",
      "── Romance Stats ──",
      "◦ Total Nembak: *" + (romanceStats.proposals || 0) + "*",
      "◦ Diterima: *" + (romanceStats.accepted || 0) + "*",
      "◦ Ditolak: *" + (romanceStats.rejected || 0) + "*",
      "◦ Putus: *" + (romanceStats.breakups || 0) + "*",
    ]);

    if (isMarried(target)) {
      const spouse = getSpouse(target);
      const marriage = user.marriage;
      const days = Math.floor((Date.now() - marriage.since) / 86400000);
      text += "\n\n" + bracketBox("💒", "ᴘᴀsᴀɴɢᴀɴ ꜱᴀᴀᴛ ɪɴɪ", [
        "◦ Pasangan: @" + spouse.split("@")[0],
        "◦ Tanggal Nikah: " + formatDate(marriage.since),
        "◦ Hari ke: " + days,
      ]);
    }

    text += "\n\n" + separator() + "\n" + tipText("Semoga pernikahan langgeng sampai jannah 🤲");
    return m.reply(text, { mentions: isMarried(target) ? [target, getSpouse(target)] : (target !== sender ? [target] : []) });
  }

  return { handled: false };
}

// ===================== PLUGIN CONFIG =====================

const pluginConfig = {
  name: "marriage",
  alias: [
    "lamar", "nikah", "melamar",
    "jawablamar", "terimalamar", "jawabnikah",
    "cerai", "divorce", "pisah",
    "statusnikah", "nikahstatus", "statuspernikahan",
    "anniversary", "anniv", "ulangtahunnikah",
    "listnikah", "daftarnikah", "listmarried",
    "marriagestats", "statsnikah",
  ],
  category: "game",
  description: "Sistem pernikahan modern — lamar, nikah, cerai, anniversary, dengan database tracking & surat nikah digital",
  usage: ".lamar @pasangan | .jawablamar [tolak] | .cerai | .statusnikah | .anniversary | .listnikah | .marriagestats",
  example: ".lamar @pasangan\n.jawablamar\n.statusnikah",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
