/**
 * Confes & Menfes — Modern Anonymous Messaging System
 * ---------------------------------------------------------------
 * Sistem confess/menfes anonymous terintegrasi database dengan:
 *
 * CONFES (ke nomor tujuan):
 * .confes <nomor>|<mode>|<pesan>   — Kirim confes anonymous
 * .confes balas <id> <pesan>      — Balas confes yang masuk
 * .confes inbox                   — Lihat confes yang masuk ke kamu
 * .confes read <id>               — Baca confes spesifik
 * .confes delete <id>             — Hapus confes
 * .confes block <nomor>           — Block orang dari kirim confes
 * .confes unblock <nomor>         — Unblock
 * .confes settings                — Pengaturan confes kamu
 * .confes stats                   — Stats confes kamu
 *
 * MENFES (broadcast ke grup):
 * .menfes <pesan>                 — Kirim menfes anonymous ke grup
 * .menfes balas <id> <pesan>      — Balas menfes
 * .menfes list                    — Daftar menfes di grup
 *
 * Modes: nembak, kenalan, ndate, pcr, lowkey, dm, sayang, curhat, teman, jomblo
 */

import config from "../../config.js";
import { getDatabase } from "../../src/lib/clara-database.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

// ===================== IN-MEMORY STORE =====================

// confesDB: Key = recipientJid -> array of { id, from, mode, message, replyTo, timestamp, read }
const confesDB = new Map();
// menfesDB: Key = groupJid -> array of { id, from, message, replyTo, timestamp }
const menfesDB = new Map();
// blockList: Key = jid -> Set of blocked jids
const blockList = new Map();
// settings: Key = jid -> { allowConfes, allowMenfes, notifyNew }
const userSettings = new Map();
// counter for IDs
let idCounter = 1;
function nextId() { return "C" + String(idCounter++).padStart(4, "0"); }

// ===================== MODES =====================

const MODES = {
  nembak:   { emoji: "🫣", label: "Nembak",    intro: "aku confess langsung" },
  kenalan:  { emoji: "🤙", label: "Kenalan",   intro: "aku mau kenalan" },
  ndate:    { emoji: "🍭", label: "Ndate",    intro: "aku mau n date kamu" },
  pcr:      { emoji: "💘", label: "PCR",       intro: "aku mau pcr sama kamu" },
  lowkey:   { emoji: "🗝️", label: "Lowkey",    intro: "aku suka kamu tapi lowkey" },
  dm:       { emoji: "📩", label: "Slide DM", intro: "aku slide ke DM kamu" },
  sayang:   { emoji: "🥺", label: "Sayang",    intro: "aku sayang kamu" },
  curhat:   { emoji: "💬", label: "Curhat",    intro: "aku mau curhat ke kamu" },
  teman:    { emoji: "🤝", label: "Teman",     intro: "aku mau jadi temen kamu" },
  jomblo:   { emoji: "💔", label: "Jomblo",    intro: "aku jomblo dan cari kamu" },
};

const OPENERS = [
  "Halo, ada yang mau ngobrol sebentar?",
  "Hai, aku liat kamu dan pengen kenalan",
  "Halo, gak apa-apa kan aku cerita sedikit?",
  "Hai, aku mau ngomongin sesuatu yang jujur",
  "Halo, ini anonim kok, santai aja",
  "Hai, ada yang pengen aku sampaikan tapi takut dong",
  "Halo, kamu gak kenal aku, tapi aku tau kamu",
];

const OUTROS = [
  "Kalo gasuka, bales aja 'ga'. Gaperlu awkward.",
  "Ini anonymous, jadi aman. Gaperlu pressure.",
  "Yang jelas ini jujur, bales engga juga gpp.",
  "Kalo cocok, bisa lanjut chat biasa. Kalo engga, aman.",
  "Gaperlu balas kalo enggak mau. Tetap cool.",
  "Ini cuma confess. Gaperlu drama, oke?",
  "Bales pakai .confes balas ya biar tetap anonim 😏",
];

// ===================== HELPERS =====================

function getDb() {
  try { return getDatabase(); } catch { return null; }
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getSettings(jid) {
  if (!userSettings.has(jid)) {
    userSettings.set(jid, { allowConfes: true, allowMenfes: true, notifyNew: true });
  }
  return userSettings.get(jid);
}

function getBlocked(jid) {
  if (!blockList.has(jid)) blockList.set(jid, new Set());
  return blockList.get(jid);
}

function getInbox(jid) {
  if (!confesDB.has(jid)) confesDB.set(jid, []);
  return confesDB.get(jid);
}

function getMenfesList(groupJid) {
  if (!menfesDB.has(groupJid)) menfesDB.set(groupJid, []);
  return menfesDB.get(groupJid);
}

function isBlocked(recipient, sender) {
  const blocked = getBlocked(recipient);
  return blocked.has(sender);
}

function buildConfesMessage(mode, pesan, targetName, confesId, isAnonim, senderName, senderNumber) {
  const m = MODES[mode] || MODES.nembak;
  const opener = pickRandom(OPENERS);
  const outro = pickRandom(OUTROS);
  const name = targetName ? `, *${targetName}*` : "";

  const headerBox = isAnonim
    ? `╔═══════════════════════════════╗\n║  ${m.emoji} CONFES ANONIM  ║\n╚═══════════════════════════════╝`
    : `╔═══════════════════════════════╗\n║  ${m.emoji} CONFES TERBUKA  ║\n╚═══════════════════════════════╝`;

  const senderInfo = isAnonim
    ? "👤 Pengirim: *Anonim* 🕵️"
    : `👤 Pengirim: *${senderName}*\n📱 Nomor: ${senderNumber}`;

  return (
    headerBox + "\n\n" +
    `Halo${name},\n\n` +
    `${opener}\n\n` +
    `${m.intro}.\n\n` +
    `💬 *"${pesan}"*\n\n` +
    `${outro}\n\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `${senderInfo}\n` +
    `🆔 ID: ${confesId}\n` +
    `🎭 Mode: ${m.emoji} ${m.label}\n` +
    `📅 ${new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}\n` +
    `🔒 Tipe: ${isAnonim ? "Anonim 🕵️" : "Terbuka 👤"}\n` +
    `━━━━━━━━━━━━━━━━━\n\n` +
    `_Balas dengan: .confes balas ${confesId} <pesan>_`
  );
}

function buildMenfesMessage(pesan, menfesId, groupName, isAnonim, senderName, senderNumber) {
  const headerBox = isAnonim
    ? `╔═══════════════════════════════╗\n║  📢 MENFES ANONIM GRUP  ║\n╚═══════════════════════════════╝`
    : `╔═══════════════════════════════╗\n║  📢 MENFES TERBUKA GRUP  ║\n╚═══════════════════════════════╝`;

  const senderInfo = isAnonim
    ? "👤 Pengirim: *Anonim* 🕵️"
    : `👤 Pengirim: *${senderName}*\n📱 Nomor: ${senderNumber}`;

  return (
    headerBox + "\n\n" +
    `${groupName ? "📍 " + groupName + "\n\n" : ""}` +
    `💬 *"${pesan}"*\n\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `${senderInfo}\n` +
    `🆔 ID: ${menfesId}\n` +
    `📅 ${new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}\n` +
    `🔒 Tipe: ${isAnonim ? "Anonim 🕵️" : "Terbuka 👤"}\n` +
    `━━━━━━━━━━━━━━━━━\n\n` +
    `_Balas dengan: .menfes balas ${menfesId} <pesan>_`
  );
}

function buildReplyMessage(replyText, originalId, isAnonim, senderName, senderNumber) {
  const headerBox = isAnonim
    ? `╔═══════════════════════════════╗\n║  💬 BALASAN ANONIM  ║\n╚═══════════════════════════════╝`
    : `╔═══════════════════════════════╗\n║  💬 BALASAN TERBUKA  ║\n╚═══════════════════════════════╝`;

  const senderInfo = isAnonim
    ? "👤 Pengirim: *Anonim* 🕵️"
    : `👤 Pengirim: *${senderName}*\n📱 Nomor: ${senderNumber}`;

  return (
    headerBox + "\n\n" +
    `💬 *"${replyText}"*\n\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `${senderInfo}\n` +
    `🆔 Reply to: ${originalId}\n` +
    `📅 ${new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}\n` +
    `🔒 Tipe: ${isAnonim ? "Anonim 🕵️" : "Terbuka 👤"}\n` +
    `━━━━━━━━━━━━━━━━━\n\n` +
    `_Balas dengan: .confes balas ${originalId} <pesan>_`
  );
}

// ===================== HANDLER =====================

async function handler(m, { sock, db: dbArg, groupMetadata, config: botConfig }) {
  const command = m.command;
  const args = (m.text || "").trim();
  const sender = m.sender;
  const isGroup = m.chat?.endsWith("@g.us");
  const prefix = botConfig?.command?.prefix || ".";

  // ===================== CONFES =====================
  if (command === "confes" || command === "confess") {
    const sub = args.toLowerCase().split(" ")[0];

    // ---- HELP / NO ARGS ----
    if (!args || !args.includes("|") && sub !== "balas" && sub !== "inbox" && sub !== "read" && sub !== "delete" && sub !== "block" && sub !== "unblock" && sub !== "settings" && sub !== "stats") {
      const modeList = Object.entries(MODES)
        .map(([k, v]) => `${v.emoji} ${k}`)
        .join("\n   ");

      let text = alyaHeader("Confes Anonymous", "💘") + "\n\n";
      text += "Sistem confess anonymous modern dengan balas, inbox, block & stats.\n\n";
      text += bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
        `◦ Kirim Anonim: *${prefix}confes <nomor>|<mode>|anon|<pesan>*`,
        `◦ Kirim Terbuka: *${prefix}confes <nomor>|<mode>|buka|<pesan>*`,
        `◦ Balas: *${prefix}confes balas <id> <pesan>*`,
        `◦ Inbox: *${prefix}confes inbox*`,
        `◦ Baca: *${prefix}confes read <id>*`,
        `◦ Hapus: *${prefix}confes delete <id>*`,
        `◦ Block: *${prefix}confes block <nomor>*`,
        `◦ Stats: *${prefix}confes stats*`,
        `◦ Setting: *${prefix}confes settings*`,
      ]) + "\n\n";
      text += bracketBox("🎭", "ᴍᴏᴅᴇ", modeList.split("\n   ")) + "\n\n";
      text += bracketBox("🔒", "ᴛɪᴘᴇ ᴘᴇɴɢɪʀɪᴍᴀɴ", [
        "🕵️ anon — Identitas tersembunyi",
        "👤 buka — Identitas diperlihatkan",
      ]) + "\n\n" + separator() + "\n" + tipText(`Contoh: ${prefix}confes 6281234567890|nembak|anon|Aku suka kamu 💕`);
      return m.reply(text);
    }

    // ---- BALAS (Reply to confes) ----
    if (sub === "balas") {
      const parts = args.split(" ");
      const confesId = parts[1];
      const replyMsg = parts.slice(2).join(" ");
      if (!confesId || !replyMsg) return m.reply(`❌ Format salah!\n\nContoh: .confes balas C0001 Iya aku juga suka kamu`);

      // Cari confes di inbox sender
      const inbox = getInbox(sender);
      const original = inbox.find(c => c.id === confesId);
      if (!original) return m.reply(`❌ Confes dengan ID ${confesId} tidak ditemukan di inbox kamu.`);

      // Kirim balasan ke pengirim asli
      // Cek apakah balasan ini anonim atau terbuka
      // Jika confes asli anonim, balasan juga anonim (default)
      // Tapi user bisa specify: .confes balas <id> anon <pesan> atau .confes balas <id> buka <pesan>
      let replyIsAnonim = original.isAnonim !== false; // default ikut confes asli
      let actualReplyMsg = replyMsg;
      if (replyMsg.toLowerCase() === "anon" || replyMsg.toLowerCase() === "anonim") {
        replyIsAnonim = true;
        actualReplyMsg = parts.slice(3).join(" ");
      } else if (replyMsg.toLowerCase() === "buka" || replyMsg.toLowerCase() === "terbuka") {
        replyIsAnonim = false;
        actualReplyMsg = parts.slice(3).join(" ");
      }
      if (!actualReplyMsg) return m.reply(`❌ Pesan tidak boleh kosong!\n\nContoh: .confes balas ${confesId} Iya aku juga suka`);

      const senderNumber = sender.split("@")[0];
      let senderName = "";
      try { senderName = (await sock.getName(sender)) || m.pushName || senderNumber; } catch { senderName = m.pushName || senderNumber; }

      const replyText = buildReplyMessage(actualReplyMsg, confesId, replyIsAnonim, senderName, senderNumber);
      try {
        await sock.sendMessage(original.from, { text: replyText });
      } catch (e) {
        return m.reply("❌ Gagal mengirim balasan. Mungkin nomor tidak aktif.");
      }

      // Tambahkan reply ke thread
      original.replies = original.replies || [];
      original.replies.push({ from: sender, message: actualReplyMsg, isAnonim: replyIsAnonim, timestamp: Date.now() });

      return m.reply(`✅ Balasan terkirim ke pengirim confes ${confesId}!\n\nBalasan tetap anonim — pengirim tidak tahu siapa kamu.`);
    }

    // ---- INBOX ----
    if (sub === "inbox") {
      const inbox = getInbox(sender);
      if (inbox.length === 0) return m.reply("📭 Inbox confes kamu kosong.");

      const unread = inbox.filter(c => !c.read).length;
      let text = alyaHeader("Inbox Confes", "📬") + "\n\n";
      text += `Total: *${inbox.length}* confes | Unread: *${unread}*\n\n`;

      for (const c of inbox.slice(-10).reverse()) {
        const modeData = MODES[c.mode] || MODES.nembak;
        const status = c.read ? "✅" : "🔵";
        const preview = c.message.length > 50 ? c.message.slice(0, 50) + "..." : c.message;
        text += `${status} 🆔 ${c.id} | ${modeData.emoji} ${modeData.label}\n`;
        text += `   💬 "${preview}"\n`;
        text += `   📅 ${new Date(c.timestamp).toLocaleDateString("id-ID")}\n`;
        if (c.replies && c.replies.length > 0) text += `   ↳ ${c.replies.length} balasan\n`;
        text += "\n";
      }

      text += separator() + "\n" + tipText(`Baca: .confes read <id> | Balas: .confes balas <id> <pesan>`);
      return m.reply(text);
    }

    // ---- READ ----
    if (sub === "read") {
      const confesId = args.split(" ")[1];
      if (!confesId) return m.reply("❌ Format: .confes read <id>");
      const inbox = getInbox(sender);
      const confes = inbox.find(c => c.id === confesId);
      if (!confes) return m.reply(`❌ Confes ${confesId} tidak ditemukan.`);
      confes.read = true;

      const modeData = MODES[confes.mode] || MODES.nembak;
      let text = alyaHeader("Confes " + confes.id, modeData.emoji) + "\n\n";
      text += bracketBox(modeData.emoji, modeData.label, [
        "🆔 ID: " + confes.id,
        "🎭 Mode: " + modeData.emoji + " " + modeData.label,
        "📅 " + new Date(confes.timestamp).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" }),
        "",
        '💬 "' + confes.message + '"',
      ]);

      if (confes.replies && confes.replies.length > 0) {
        text += "\n\n" + bracketBox("💬", "ʙᴀʟᴀsᴀɴ", confes.replies.map((r, i) =>
          `${i + 1}. "${r.message}"\n   📅 ${new Date(r.timestamp).toLocaleDateString("id-ID")}`
        ));
      }

      text += "\n\n" + separator() + "\n" + tipText(`Balas: .confes balas ${confes.id} <pesan>`);
      return m.reply(text);
    }

    // ---- DELETE ----
    if (sub === "delete") {
      const confesId = args.split(" ")[1];
      if (!confesId) return m.reply("❌ Format: .confes delete <id>");
      const inbox = getInbox(sender);
      const idx = inbox.findIndex(c => c.id === confesId);
      if (idx === -1) return m.reply(`❌ Confes ${confesId} tidak ditemukan.`);
      inbox.splice(idx, 1);
      return m.reply(`✅ Confes ${confesId} dihapus dari inbox.`);
    }

    // ---- BLOCK ----
    if (sub === "block") {
      const numRaw = args.split(" ")[1];
      if (!numRaw) return m.reply("❌ Format: .confes block <nomor>\n\nContoh: .confes block 6281234567890");
      const num = numRaw.replace(/\D/g, "");
      const targetJid = num + "@s.whatsapp.net";
      getBlocked(sender).add(targetJid);
      return m.reply(`✅ Nomor ${num} diblokir dari mengirim confes ke kamu.`);
    }

    // ---- UNBLOCK ----
    if (sub === "unblock") {
      const numRaw = args.split(" ")[1];
      if (!numRaw) return m.reply("❌ Format: .confes unblock <nomor>");
      const num = numRaw.replace(/\D/g, "");
      const targetJid = num + "@s.whatsapp.net";
      getBlocked(sender).delete(targetJid);
      return m.reply(`✅ Nomor ${num} di-unblock.`);
    }

    // ---- SETTINGS ----
    if (sub === "settings") {
      const s = getSettings(sender);
      const toggle = args.toLowerCase().split(" ")[1];
      if (toggle === "on") { s.allowConfes = true; return m.reply("✅ Confes diaktifkan. Kamu bisa menerima confes."); }
      if (toggle === "off") { s.allowConfes = false; return m.reply("⛔ Confes dinonaktifkan. Tidak bisa menerima confes."); }
      if (toggle === "notify") { s.notifyNew = !s.notifyNew; return m.reply("✅ Notifikasi confes: " + (s.notifyNew ? "ON" : "OFF")); }

      let text = alyaHeader("Confes Settings", "⚙️") + "\n\n";
      text += bracketBox("⚙️", "ᴘᴇɴɢᴀᴛᴜʀᴀɴ", [
        "◦ Terima confes: " + (s.allowConfes ? "✅ ON" : "⛔ OFF"),
        "◦ Notifikasi: " + (s.notifyNew ? "✅ ON" : "⛔ OFF"),
        "",
        `.confes settings on  — Aktifkan confes`,
        `.confes settings off — Nonaktifkan confes`,
        `.confes settings notify — Toggle notifikasi`,
      ]);
      return m.reply(text);
    }

    // ---- STATS ----
    if (sub === "stats") {
      const inbox = getInbox(sender);
      const unread = inbox.filter(c => !c.read).length;
      const replied = inbox.filter(c => c.replies && c.replies.length > 0).length;
      const blocked = getBlocked(sender).size;

      let text = alyaHeader("Confes Stats", "📊") + "\n\n";
      text += bracketBox("📈", "ꜱᴛᴀᴛɪꜱᴛɪᴋ", [
        "◦ Total diterima: *" + inbox.length + "*",
        "◦ Belum dibaca: *" + unread + "*",
        "◦ Sudah dibalas: *" + replied + "*",
        "◦ Blocked: *" + blocked + "* nomor",
        "◦ Status: " + (getSettings(sender).allowConfes ? "✅ Aktif" : "⛔ Nonaktif"),
      ]) + "\n\n" + separator() + "\n" + tipText("Ketik .confes inbox untuk lihat semua confes");
      return m.reply(text);
    }

    // ---- KIRIM CONFES (default) ----
    // Format: .confes <nomor>|<mode>|<anon|buka>|<pesan>
    // Backward compat: .confes <nomor>|<mode>|<pesan> (default: anon)
    if (!args.includes("|")) return m.reply(`❌ Format salah!\n\nContoh:\n.confes 6281234567890|nembak|anon|Aku suka kamu\n.confes 6281234567890|nembak|buka|Aku suka kamu`);

    const parts = args.split("|").map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) return m.reply(`❌ Format salah!\n\nContoh: .confes 6281234567890|nembak|anon|Aku suka kamu`);

    const [numberRaw, modeRaw, thirdPart, ...rest] = parts;
    const number = String(numberRaw).replace(/\D/g, "");
    const mode = String(modeRaw).toLowerCase();

    // Cek apakah bagian ketiga adalah "anon" atau "buka"
    let isAnonim = true; // default anonim
    let pesan = "";
    if (thirdPart === "anon" || thirdPart === "anonim" || thirdPart === "a") {
      isAnonim = true;
      pesan = rest.join("|");
    } else if (thirdPart === "buka" || thirdPart === "terbuka" || thirdPart === "t" || thirdPart === "publik") {
      isAnonim = false;
      pesan = rest.join("|");
    } else {
      // Backward compat: tidak ada tipe, anggap sisanya adalah pesan
      isAnonim = true;
      pesan = [thirdPart, ...rest].join("|");
    }

    if (!number || !MODES[mode] || !pesan) return m.reply(`❌ Mode tidak valid atau pesan kosong!\n\nMode: ${Object.keys(MODES).join(", ")}\nTipe: anon, buka`);

    const targetJid = number + "@s.whatsapp.net";

    // Cek block
    if (isBlocked(targetJid, sender)) return m.reply("⛔ Kamu diblokir oleh pengguna ini dari mengirim confes.");

    // Cek settings target
    const targetSettings = getSettings(targetJid);
    if (!targetSettings.allowConfes) return m.reply("⛔ Pengguna ini sedang tidak menerima confes.");

    // Cek nomor valid
    let targetName = "";
    try {
      const exists = await sock.onWhatsApp(targetJid);
      if (!exists || !exists[0]?.exists) return m.reply("❌ Nomor tidak terdaftar di WhatsApp.");
      targetName = exists[0]?.name || exists[0]?.notify || "";
    } catch { /* ignore */ }

    // Buat confes
    const confesId = nextId();
    // Dapatkan info pengirim
    const senderNumber = sender.split("@")[0];
    let senderName = "";
    try { senderName = (await sock.getName(sender)) || m.pushName || senderNumber; } catch { senderName = m.pushName || senderNumber; }

    const confesMsg = buildConfesMessage(mode, pesan, targetName, confesId, isAnonim, senderName, senderNumber);

    // Kirim ke target
    try {
      await sock.sendMessage(targetJid, { text: confesMsg });
    } catch (e) {
      return m.reply("❌ Gagal mengirim confes. Mungkin nomor tidak aktif.");
    }

    // Simpan ke inbox target
    const inbox = getInbox(targetJid);
    inbox.push({
      id: confesId,
      from: sender,
      mode: mode,
      message: pesan,
      isAnonim: isAnonim,
      replies: [],
      timestamp: Date.now(),
      read: false,
    });

    // Receipt ke pengirim
    const modeData = MODES[mode];
    let receipt = alyaHeader("Confes Terkirim", "✅") + "\n\n";
    receipt += bracketBox("✅", modeData.label, [
      "◦ Ke: " + number,
      "◦ Mode: " + modeData.emoji + " " + modeData.label,
      "◦ Tipe: " + (isAnonim ? "Anonim 🕵️" : "Terbuka 👤"),
      "◦ ID: " + confesId,
      "◦ Status: *Terkirim*",
    ]) + "\n\n" + separator() + "\n" + tipText(isAnonim ? "Identitasmu tersembunyi 🕵️" : "Identitasmu diperlihatkan 👤");

    return m.reply(receipt);
  }

  // ===================== MENFES =====================
  if (command === "menfes" || command === "menfess") {
    if (!isGroup) return m.reply("❌ Menfes hanya bisa di grup!");

    const sub = args.toLowerCase().split(" ")[0];

    // ---- LIST ----
    if (sub === "list") {
      const list = getMenfesList(m.chat);
      if (list.length === 0) return m.reply("📭 Belum ada menfes di grup ini.");

      let text = alyaHeader("Menfes Grup", "📢") + "\n\n";
      text += "Total: *" + list.length + "* menfes\n\n";

      for (const f of list.slice(-10).reverse()) {
        const preview = f.message.length > 60 ? f.message.slice(0, 60) + "..." : f.message;
        text += "🆔 " + f.id + "\n";
        text += '   💬 "' + preview + '"\n';
        text += "   📅 " + new Date(f.timestamp).toLocaleDateString("id-ID") + "\n";
        if (f.replies && f.replies.length > 0) text += "   ↳ " + f.replies.length + " balasan\n";
        text += "\n";
      }

      text += separator() + "\n" + tipText("Balas: .menfes balas <id> <pesan>");
      return m.reply(text);
    }

    // ---- BALAS ----
    if (sub === "balas") {
      const parts = args.split(" ");
      const menfesId = parts[1];
      const replyMsg = parts.slice(2).join(" ");
      if (!menfesId || !replyMsg) return m.reply("❌ Format: .menfes balas <id> <pesan>");

      const list = getMenfesList(m.chat);
      const original = list.find(f => f.id === menfesId);
      if (!original) return m.reply("❌ Menfes " + menfesId + " tidak ditemukan.");

      // Kirim balasan ke grup (anonim)
      // Cek tipe balasan: anon atau buka
      let replyIsAnonim = original.isAnonim !== false;
      let actualReplyMsg = replyMsg;
      if (replyMsg.toLowerCase() === "anon" || replyMsg.toLowerCase() === "anonim") {
        replyIsAnonim = true;
        actualReplyMsg = parts.slice(3).join(" ");
      } else if (replyMsg.toLowerCase() === "buka" || replyMsg.toLowerCase() === "terbuka") {
        replyIsAnonim = false;
        actualReplyMsg = parts.slice(3).join(" ");
      }
      if (!actualReplyMsg) return m.reply(`❌ Pesan tidak boleh kosong!\n\nContoh: .menfes balas ${menfesId} Iya aku mau!`);

      const senderNumber = sender.split("@")[0];
      let senderName = "";
      try { senderName = (await sock.getName(sender)) || m.pushName || senderNumber; } catch { senderName = m.pushName || senderNumber; }

      const replyText = buildReplyMessage(actualReplyMsg, menfesId, replyIsAnonim, senderName, senderNumber);
      await m.reply(replyText);

      // Simpan reply
      original.replies = original.replies || [];
      original.replies.push({ from: sender, message: actualReplyMsg, isAnonim: replyIsAnonim, timestamp: Date.now() });

      return;
    }

    // ---- KIRIM MENFES ----
    // Format: .menfes <anon|buka> <pesan>  atau  .menfes <pesan> (default: anon)
    if (!args) return m.reply(`❌ Format:\n.menfes anon <pesan> — Anonim\n.menfes buka <pesan> — Terbuka\n.menfes <pesan> — Default (anonim)\n\nContoh: .menfes buka Ada yang mau kenalan?`);

    let menfesIsAnonim = true;
    let menfesPesan = args;
    const menfesSub = args.toLowerCase().split(" ")[0];
    if (menfesSub === "anon" || menfesSub === "anonim") {
      menfesIsAnonim = true;
      menfesPesan = args.split(" ").slice(1).join(" ");
    } else if (menfesSub === "buka" || menfesSub === "terbuka" || menfesSub === "publik") {
      menfesIsAnonim = false;
      menfesPesan = args.split(" ").slice(1).join(" ");
    }

    if (!menfesPesan) return m.reply(`❌ Pesan tidak boleh kosong!\n\nContoh: .menfes buka Halo semua!`);

    const menfesId = nextId();
    let groupName = "";
    try {
      const meta = groupMetadata || await sock.groupMetadata(m.chat);
      groupName = meta?.subject || "";
    } catch { /* ignore */ }

    const senderNumber = sender.split("@")[0];
    let senderName = "";
    try { senderName = (await sock.getName(sender)) || m.pushName || senderNumber; } catch { senderName = m.pushName || senderNumber; }

    const menfesMsg = buildMenfesMessage(menfesPesan, menfesId, groupName, menfesIsAnonim, senderName, senderNumber);

    // Kirim ke grup
    await m.reply(menfesMsg);

    // Simpan ke menfesDB
    const list = getMenfesList(m.chat);
    list.push({
      id: menfesId,
      from: sender,
      message: menfesPesan,
      isAnonim: menfesIsAnonim,
      replies: [],
      timestamp: Date.now(),
    });

    return;
  }

  return { handled: false };
}

// ===================== PLUGIN CONFIG =====================

const pluginConfig = {
  name: "confes",
  alias: ["confes", "confess", "menfes", "menfess"],
  category: "fun",
  description: "Sistem confes & menfes anonymous modern — kirim, balas, inbox, block, stats, settings",
  usage: ".confes <nomor>|<mode>|<pesan> | .confes balas <id> <pesan> | .confes inbox | .menfes <pesan>",
  example: ".confes 6281234567890|nembak|Aku suka kamu\n.confes inbox\n.menfes Ada yang mau kenalan?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
