// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Romance System — Modern Love & Relationship Engine
 * ---------------------------------------------------------------
 * Sistem jadian/pacaran terintegrasi database dengan:
 * - Propose (nembak) dengan pending status
 * - Target jawab terima/tolak
 * - Data tersimpan di database (siapa jadian sama siapa, sejak kapan)
 * - Relationship timeline & anniversary counter
 * - Breakup dengan alasan
 * - Anti-cheat: gak bisa nembak diri sendiri, gak bisa nembak orang sudah jadian
 * - Love stats (total proposal diterima/ditolak)
 * - Leaderboard couple terlama di grup
 *
 * Commands:
 * .nembak @user         — Kirim proposal ke seseorang
 * .tembak @user         — Alias nembak
 * .terima               — Terima proposal terakhir (reply pesan)
 * .terima @user         — Terima proposal dari user tertentu
 * .tolak                — Tolak proposal terakhir (reply pesan)
 * .tolak @user          — Tolak proposal dari user tertentu
 * .putus @user          — Putus dari pasangan
 * .couple               — Lihat status hubunganmu
 * .cekjadian @user      — Cek compatibility
 * .pacar @user          — Lihat status pasangan orang
 * .romancestats        — Stats romance kamu
 * .lovestats           — Alias romancestats
 * .listcouple           — Daftar couple di grup ini
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

// Key: targetJid -> { from, message, timestamp, expiresAt }
const pendingProposals = new Map();

// Key: groupJid -> Set of couple pairs
const groupCouples = new Map();

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
    user = { romance: null, romanceStats: { proposals: 0, accepted: 0, rejected: 0, breakups: 0 } };
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

function getRomanceData(jid) {
  const user = getUserData(jid);
  if (!user) return null;
  if (!user.romance) user.romance = null;
  if (!user.romanceStats) user.romanceStats = { proposals: 0, accepted: 0, rejected: 0, breakups: 0 };
  return user;
}

function isCoupled(jid) {
  const user = getRomanceData(jid);
  return user && user.romance && user.romance.partner;
}

function getPartner(jid) {
  const user = getRomanceData(jid);
  return user && user.romance ? user.romance.partner : null;
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

// ===================== PROPOSAL MESSAGES =====================

const PROPOSAL_LINES = [
  "Hai, aku mau jujur... dari pertama kali kita kenal, aku udah ngerasa ada yang beda. Maukah kamu jadi pacarku? 🌹",
  "Setiap kali ngobrol sama kamu, duniaku seolah berhenti berputar. Apakah kamu mau menjadi bagian dari hidupku? 💕",
  "Aku bukan pujangga, tapi untuk kamu aku mau belajar merangkai kata. Mau kamu jadi pacarku? 💌",
  "Gak perlu alasan untuk ngejadian kamu, yang aku tahu cuma hatiku yang bilang: ambil dia sebelum diambil orang! 😤❤️",
  "Kalo kamu adalah puzzle, aku mau jadi bagian yang nyempelin ke hidupmu. Mau jadi pacarku? 🧩💕",
];

const ACCEPT_LINES = [
  "Iya, aku terima! Dari dulu aku nunggu kamu ngomong gini 🥹❤️",
  "YES! Akhirnya! Aku juga suka sama kamu dari lama tapi gak berani bilang 💕✨",
  "Tentu saja aku mau! Bismillah, semoga kita awet sampai pelaminan 💍💖",
  "Aku udah nunggu momen ini... YA, aku mau jadi pacarmu! 😘💞",
  "Tanpa ragu... aku terima cintamu! Jangan pernah tinggalin aku ya 💕",
];

const REJECT_LINES = [
  "Maaf ya... kamu terlalu baik buat aku. Kita temenan aja 🙏💔",
  "Aku hargai perasaanmu, tapi hatiku lagi nggak siap buat hubungan sekarang 🌧️",
  "Mungkin bukan saatnya. Kamu akan nemuin yang lebih baik kok 💪",
  "Maaf, aku cuma ngelihat kamu sebagai teman. Jangan sedih ya 🤗",
  "Sinyal hatiku belum nyampe ke kamu. Coba lagi lain kali? 😅",
];

const BREAKUP_LINES = [
  "Maaf, aku rasa kita harus berpisah. Semoga kamu menemukan kebahagiaanmu 💔",
  "Hubungan kita sudah tidak sehat lagi. Mariakhiri dengan baik 🙏",
  "Aku butuh waktu sendiri. Maaf, putus ya 🥀",
  "Bukan karena aku gak sayang, tapi kita memang gak cocok lagi 💔",
  "Terima kasih untuk semuanya, tapi aku harus pergi. Goodbye 💨",
];

// ===================== HANDLER =====================

async function handler(m, { sock, db: dbArg, groupMetadata }) {
  const command = m.command;
  const args = (m.text || "").trim();
  const sender = m.sender;
  const isGroup = m.chat?.endsWith("@g.us");

  // ===================== NEMBAK / TEMBAK =====================
  if (command === "nembak" || command === "tembak" || command === "confess") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");
    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) return m.reply("❌ Tag atau reply orang yang mau kamu nembak!\n\nContoh: .nembak @user");
    if (target === sender) return m.reply("❌ Masa nembak diri sendiri? 🗿");

    // Cek apakah pengirim sudah jadian
    if (isCoupled(sender)) {
      const partner = getPartner(sender);
      return m.reply("⚠️ Kamu sudah jadian sama @" + partner.split("@")[0] + "!\nKetik .putus dulu kalau mau pindah hati 😏", { mentions: [partner] });
    }

    // Cek apakah target sudah jadian
    if (isCoupled(target)) {
      const tPartner = getPartner(target);
      return m.reply("💔 Maaf, @" + target.split("@")[0] + " sudah jadian sama @" + tPartner.split("@")[0] + "!\nTelat cuy 😅", { mentions: [target, tPartner] });
    }

    // Cek pending proposal ke target yang sama
    const existing = pendingProposals.get(target);
    if (existing && existing.from === sender) {
      return m.reply("⏳ Kamu sudah nembak @" + target.split("@")[0] + "! Tunggu jawabannya ya.\n\nProposal akan expire dalam 24 jam.", { mentions: [target] });
    }

    // Cek apakah ada proposal pending dari target ke sender (auto-match!)
    const reverseProposal = pendingProposals.get(sender);
    if (reverseProposal && reverseProposal.from === target) {
      // Auto-accept! Match made in heaven
      pendingProposals.delete(sender);
      pendingProposals.delete(target);

      const now = Date.now();
      const senderUser = getRomanceData(sender);
      const targetUser = getRomanceData(target);

      senderUser.romance = { partner: target, since: now, group: m.chat };
      senderUser.romanceStats.accepted = (senderUser.romanceStats.accepted || 0) + 1;
      saveUserData(sender, senderUser);

      targetUser.romance = { partner: sender, since: now, group: m.chat };
      targetUser.romanceStats.accepted = (targetUser.romanceStats.accepted || 0) + 1;
      saveUserData(target, targetUser);

      const line = pickRandom(ACCEPT_LINES);
      let text = alyaHeader("Auto-Match! 💘✨", "💖") + "\n\n";
      text += bracketBox("🎯", "ᴀᴜᴛᴏ-ᴍᴀᴛᴄʜ", [
        "◦ Ternyata kalian saling nembak!",
        "◦ Status: *Resmi Jadian!*",
        "",
        "💌 " + line,
        "",
        "👫 @" + sender.split("@")[0] + " ❤️ @" + target.split("@")[0],
        "📅 Sejak: " + formatDate(now),
      ]) + "\n\n" + separator() + "\n" + tipText("Selamat! Cinta tak bertepuk sebelah tangan 🎉");

      return m.reply(text, { mentions: [sender, target] });
    }

    // Buat proposal baru
    const proposalMsg = pickRandom(PROPOSAL_LINES);
    pendingProposals.set(target, {
      from: sender,
      message: proposalMsg,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
    });

    // Update stats pengirim
    const senderUser = getRomanceData(sender);
    senderUser.romanceStats.proposals = (senderUser.romanceStats.proposals || 0) + 1;
    saveUserData(sender, senderUser);

    let text = alyaHeader("Proposal Terkirim 💌", " Cupid") + "\n\n";
    text += bracketBox("💝", "ᴘʀᴏᴘᴏꜱᴀʟ", [
      "◦ Dari: @" + sender.split("@")[0],
      "◦ Untuk: @" + target.split("@")[0],
      "◦ Status: *Menunggu Jawaban*",
      "",
      "💌 \"" + proposalMsg + "\"",
      "",
      "⏳ Expire dalam 24 jam",
    ]) + "\n\n" + separator() + "\n" + tipText("@" + target.split("@")[0] + " ketik .terima atau .tolak untuk jawab!", { mentions: [target] });

    return m.reply(text, { mentions: [sender, target] });
  }

  // ===================== TERIMA =====================
  if (command === "terima" || command === "accept" || command === "terimacinta") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    // Cari proposal: dari argumen tag, reply, atau pending terakhir
    let proposer = null;
    const tagged = m.mentionedJid?.[0] || m.quoted?.sender;

    if (tagged) {
      // Cek apakah ada proposal dari tagged user
      const proposal = pendingProposals.get(sender);
      if (proposal && proposal.from === tagged) {
        proposer = tagged;
      } else {
        return m.reply("❌ Tidak ada proposal dari @" + tagged.split("@")[0] + "!", { mentions: [tagged] });
      }
    } else {
      // Ambil proposal terakhir yang pending
      const proposal = pendingProposals.get(sender);
      if (!proposal) return m.reply("📭 Tidak ada proposal yang menunggu jawabanmu.");
      proposer = proposal.from;
    }

    // Cek expiry
    const proposal = pendingProposals.get(sender);
    if (!proposal || proposal.from !== proposer) {
      return m.reply("❌ Proposal sudah expire atau tidak ditemukan.");
    }
    if (Date.now() > proposal.expiresAt) {
      pendingProposals.delete(sender);
      return m.reply("⏰ Proposal sudah expire (lebih dari 24 jam).");
    }

    // Cek apakah sudah jadian salah satu
    if (isCoupled(sender)) return m.reply("⚠️ Kamu sudah jadian! Ketik .putus dulu.");
    if (isCoupled(proposer)) return m.reply("💔 Maaf, @" + proposer.split("@")[0] + " sudah jadian sama orang lain!", { mentions: [proposer] });

    // Accept!
    pendingProposals.delete(sender);
    const now = Date.now();

    const senderUser = getRomanceData(sender);
    senderUser.romance = { partner: proposer, since: now, group: m.chat };
    senderUser.romanceStats.accepted = (senderUser.romanceStats.accepted || 0) + 1;
    saveUserData(sender, senderUser);

    const proposerUser = getRomanceData(proposer);
    proposerUser.romance = { partner: sender, since: now, group: m.chat };
    proposerUser.romanceStats.accepted = (proposerUser.romanceStats.accepted || 0) + 1;
    saveUserData(proposer, proposerUser);

    const line = pickRandom(ACCEPT_LINES);
    let text = alyaHeader("Cinta Diterima! 💑", "💖") + "\n\n";
    text += bracketBox("💕", "ꜱᴛᴀᴛᴜꜱ ʜᴜʙᴜɴɢᴀɴ", [
      "◦ Pasangan: @" + proposer.split("@")[0] + " ❤️ @" + sender.split("@")[0],
      "◦ Status: *Resmi Jadian!*",
      "◦ Tanggal: " + formatDate(now),
      "",
      "💌 \"" + line + "\"",
    ]) + "\n\n" + separator() + "\n" + tipText("Selamat atas hubungan kalian! 🎉💍");

    return m.reply(text, { mentions: [sender, proposer] });
  }

  // ===================== TOLAK =====================
  if (command === "tolak" || command === "reject" || command === "tolakcinta") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    let proposer = null;
    const tagged = m.mentionedJid?.[0] || m.quoted?.sender;

    if (tagged) {
      const proposal = pendingProposals.get(sender);
      if (proposal && proposal.from === tagged) {
        proposer = tagged;
      } else {
        return m.reply("❌ Tidak ada proposal dari @" + tagged.split("@")[0] + "!", { mentions: [tagged] });
      }
    } else {
      const proposal = pendingProposals.get(sender);
      if (!proposal) return m.reply("📭 Tidak ada proposal yang menunggu jawabanmu.");
      proposer = proposal.from;
    }

    const proposal = pendingProposals.get(sender);
    if (!proposal || proposal.from !== proposer) {
      return m.reply("❌ Proposal sudah expire atau tidak ditemukan.");
    }

    // Reject
    pendingProposals.delete(sender);

    const senderUser = getRomanceData(sender);
    senderUser.romanceStats.rejected = (senderUser.romanceStats.rejected || 0) + 1;
    saveUserData(sender, senderUser);

    const proposerUser = getRomanceData(proposer);
    proposerUser.romanceStats.rejected = (proposerUser.romanceStats.rejected || 0) + 1;
    saveUserData(proposer, proposerUser);

    const line = pickRandom(REJECT_LINES);
    let text = alyaHeader("Penolakan Cinta 💔", "🥀") + "\n\n";
    text += bracketBox("💔", "ʜᴀsɪʟ", [
      "◦ Penolak: @" + sender.split("@")[0],
      "◦ Ditolak: @" + proposer.split("@")[0],
      "◦ Status: *Ditolak*",
      "",
      "💬 \"" + line + "\"",
    ]) + "\n\n" + separator() + "\n" + tipText("Tetap semangat! Masih banyak ikan di lautan 🐟🌊");

    return m.reply(text, { mentions: [sender, proposer] });
  }

  // ===================== PUTUS =====================
  if (command === "putus" || command === "breakup" || command === "putuspacar") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    if (!isCoupled(sender)) return m.reply("💔 Kamu belum jadian sama siapapun.");

    const partner = getPartner(sender);
    const reason = args || "Tanpa alasan";

    // Update both users
    const senderUser = getRomanceData(sender);
    const duration = senderUser.romance.since ? Date.now() - senderUser.romance.since : 0;
    senderUser.romance = null;
    senderUser.romanceStats.breakups = (senderUser.romanceStats.breakups || 0) + 1;
    saveUserData(sender, senderUser);

    const partnerUser = getRomanceData(partner);
    if (partnerUser) {
      partnerUser.romance = null;
      partnerUser.romanceStats.breakups = (partnerUser.romanceStats.breakups || 0) + 1;
      saveUserData(partner, partnerUser);
    }

    const line = pickRandom(BREAKUP_LINES);
    let text = alyaHeader("Putus 💔", "🥀") + "\n\n";
    text += bracketBox("💔", "ᴘᴜᴛᴜs ʜᴜʙᴜɴɢᴀɴ", [
      "◦ @" + sender.split("@")[0] + " ❤️ @" + partner.split("@")[0],
      "◦ Status: *Putus*",
      "◦ Durasi: " + formatDuration(duration),
      "◦ Alasan: " + reason,
      "",
      "💬 \"" + line + "\"",
    ]) + "\n\n" + separator() + "\n" + tipText("Semoga kalian menemukan kebahagiaan masing-masing 🙏");

    return m.reply(text, { mentions: [sender, partner] });
  }

  // ===================== COUPLE STATUS =====================
  if (command === "couple" || command === "status" || command === "hubungan") {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || sender;
    const targetName = target === sender ? "Kamu" : (m.pushName || "@" + target.split("@")[0]);

    if (!isCoupled(target)) {
      let text = alyaHeader("Status Hubungan 💑", "💔") + "\n\n";
      text += bracketBox("📋", "ꜱᴛᴀᴛᴜꜱ", [
        "◦ " + targetName + " sedang *single* 🎶",
        "◦ Belum terikat hubungan dengan siapapun",
      ]) + "\n\n" + separator() + "\n" + tipText("Ketik .nembak @user untuk mulai!");
      return m.reply(text, { mentions: target !== sender ? [target] : [] });
    }

    const partner = getPartner(target);
    const romance = getRomanceData(target).romance;
    const duration = Date.now() - romance.since;
    const days = Math.floor(duration / 86400000);

    let text = alyaHeader("Status Hubungan 💑", "💖") + "\n\n";
    text += bracketBox("💕", "ʀᴇʟᴀᴛɪᴏɴꜱʜɪᴘ", [
      "◦ " + targetName + " ❤️ @" + partner.split("@")[0],
      "◦ Status: *Pacaran* 💑",
      "◦ Sejak: " + formatDate(romance.since),
      "◦ Durasi: " + formatDuration(duration),
      "◦ Hari ke: *" + days + "*",
    ]) + "\n\n" + separator() + "\n" + tipText(days < 7 ? "Masih bulan madu! 🌹" : days < 30 ? "Hubungan stabil! 👏" : days < 100 ? "Hubungan awet! 💪" : "Couple goals! 🏆");

    return m.reply(text, { mentions: [target, partner] });
  }

  // ===================== PACAR (lihat pasangan orang) =====================
  if (command === "pacar") {
    return handler({ ...m, command: "couple" }, { sock, db: dbArg, groupMetadata });
  }

  // ===================== CEK JADIAN (compatibility) =====================
  if (command === "cekjadian" || command === "cekjodoh" || command === "cekcinta") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");
    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) return m.reply("❌ Tag seseorang untuk cek compatibility!\n\nContoh: .cekjadian @user");
    if (target === sender) return m.reply("❌ Cek compatibility sama diri sendiri? 🗿");

    // Generate compatibility score
    const name1 = (m.pushName || sender).toLowerCase();
    const name2 = (target.split("@")[0]).toLowerCase();
    let score = 0;
    const combined = name1 + name2;
    for (let i = 0; i < combined.length; i++) {
      score += combined.charCodeAt(i);
    }
    score = (score % 100) + 1; // 1-100

    let tier, emoji, note;
    if (score >= 90) { tier = "Soulmate"; emoji = "👑"; note = "Kalau bukan jodoh, apalagi!"; }
    else if (score >= 75) { tier = "High Match"; emoji = "💘"; note = "Beda tapi saling melengkapi"; }
    else if (score >= 60) { tier = "Cocok"; emoji = "❤️"; note = "Ada chemistry, butuh usaha"; }
    else if (score >= 45) { tier = "Biasa"; emoji = "🫠"; note = "Bisa, tapi agak gak nyambung"; }
    else { tier = "Friendzone"; emoji = "💔"; note = "Mending jadian temen dulu"; }

    let text = alyaHeader("Love Compatibility 💘", emoji) + "\n\n";
    text += bracketBox(emoji, "ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴛʏ", [
      "◦ @" + sender.split("@")[0] + " ❤️ @" + target.split("@")[0],
      "◦ Match Score: *" + score + "%*",
      "◦ Tier: " + emoji + " *" + tier + "*",
      "",
      "💬 " + note,
    ]) + "\n\n" + separator() + "\n" + tipText(score >= 60 ? "Lagi, tunggu apa? .nembak @" + target.split("@")[0] + " 🌹" : "Mungkin perlu usaha lebih ya 😅");

    return m.reply(text, { mentions: [sender, target] });
  }

  // ===================== ROMANCE STATS =====================
  if (command === "romancestats" || command === "lovestats") {
    const target = m.mentionedJid?.[0] || sender;
    const user = getRomanceData(target);
    if (!user) return m.reply("❌ Data tidak ditemukan.");

    const stats = user.romanceStats || { proposals: 0, accepted: 0, rejected: 0, breakups: 0 };
    const successRate = stats.proposals > 0 ? Math.round((stats.accepted / stats.proposals) * 100) : 0;

    let text = alyaHeader("Romance Stats 📊", "💘") + "\n\n";
    text += bracketBox("📈", "ʀᴏᴍᴀɴᴄᴇ ꜱᴛᴀᴛɪꜱᴛɪᴋ", [
      "◦ Status: " + (isCoupled(target) ? "Pacaran 💑" : "Single 🎶"),
      "◦ Total Nembak: *" + (stats.proposals || 0) + "*",
      "◦ Diterima: *" + (stats.accepted || 0) + "* ✅",
      "◦ Ditolak: *" + (stats.rejected || 0) + "* ❌",
      "◦ Putus: *" + (stats.breakups || 0) + "* 💔",
      "◦ Success Rate: *" + successRate + "%*",
    ]);

    if (isCoupled(target)) {
      const partner = getPartner(target);
      const romance = user.romance;
      const days = Math.floor((Date.now() - romance.since) / 86400000);
      text += "\n\n" + bracketBox("💑", "ᴘᴀsᴀɴɢᴀɴ ꜱᴀᴀᴛ ɪɴɪ", [
        "◦ Pasangan: @" + partner.split("@")[0],
        "◦ Sejak: " + formatDate(romance.since),
        "◦ Hari ke: " + days,
      ]);
    }

    text += "\n\n" + separator() + "\n" + tipText("Terus berjuang demi cinta! 💪❤️");
    return m.reply(text, { mentions: isCoupled(target) ? [target, getPartner(target)] : (target !== sender ? [target] : []) });
  }

  // ===================== LIST COUPLE =====================
  if (command === "listcouple" || command === "daftarcouple") {
    if (!isGroup) return m.reply("❌ Hanya bisa di grup!");

    const meta = groupMetadata || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return m.reply("❌ Gagal mendapatkan info grup.");

    const couples = [];
    const checked = new Set();

    for (const p of meta.participants) {
      const jid = p.id;
      if (checked.has(jid)) continue;
      if (isCoupled(jid)) {
        const partner = getPartner(jid);
        if (partner && !checked.has(partner)) {
          const romance = getRomanceData(jid).romance;
          const days = Math.floor((Date.now() - romance.since) / 86400000);
          couples.push({
            a: jid,
            b: partner,
            since: romance.since,
            days,
          });
          checked.add(jid);
          checked.add(partner);
        }
      }
    }

    if (couples.length === 0) {
      let text = alyaHeader("Daftar Couple 💑", "💔") + "\n\n";
      text += "Belum ada couple di grup ini.\n\n" + separator() + "\n" + tipText("Jadi yang pertama! .nembak @user 🌹");
      return m.reply(text);
    }

    // Sort by longest relationship
    couples.sort((a, b) => b.days - a.days);

    let text = alyaHeader("Daftar Couple 💑", "💖") + "\n\n";
    text += "Total: *" + couples.length + "* couple di grup ini\n\n";

    const mentions = [];
    for (let i = 0; i < couples.length; i++) {
      const c = couples[i];
      mentions.push(c.a, c.b);
      let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + ".";
      text += medal + " @" + c.a.split("@")[0] + " ❤️ @" + c.b.split("@")[0] + "\n";
      text += "   📅 " + c.days + " hari (" + formatDate(c.since) + ")\n\n";
    }

    text += separator() + "\n" + tipText("Couple terlama: @" + couples[0].a.split("@")[0] + " & @" + couples[0].b.split("@")[0] + " 🏆");
    return m.reply(text, { mentions });
  }

  return { handled: false };
}

// ===================== PLUGIN CONFIG =====================

const pluginConfig = {
  name: "romance",
  alias: [
    "nembak", "tembak",
    "terima", "terimacinta",
    "tolak", "tolakcinta",
    "putus", "breakup", "putuspacar",
    "couple", "hubungan", "pacar",
    "cekjadian", "cekjodoh", "cekcinta",
    "romancestats", "lovestats",
    "listcouple", "daftarcouple",
  ],
  category: "game",
  description: "Sistem jadian/pacaran modern dengan database tracking, proposal, terima/tolak, breakup, stats & leaderboard",
  usage: ".nembak @user | .terima | .tolak | .putus | .couple | .cekjadian @user | .romancestats | .listcouple",
  example: ".nembak @user\n.terima\n.couple",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
