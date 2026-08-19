/**
 * Broadcast Channel System — Advanced
 * ---------------------------------------------------------------
 * Sistem broadcast ke saluran/channel dengan fitur:
 * - Enable/Disable broadcast
 * - Subscriber list (daftar pengguna terdaftar)
 * - Banned list (pengguna yang diban dari menerima broadcast)
 * - Anti-spam (cooldown per user untuk mencegah spam broadcast)
 * - Broadcast ke grup, private, atau semua
 * - Broadcast dengan media (image/video/document)
 * - Broadcast stats (total terkirim, gagal, dibaca)
 * - Auto-subscribe untuk user baru
 *
 * Commands:
 * .broadcast          — Kirim broadcast ke semua subscriber
 * .bc                 — Alias broadcast
 * .bcsub              — Lihat daftar subscriber
 * .bcban <@tag/628x>  — Ban user dari broadcast
 * .bcunban <@tag/628x>— Unban user
 * .bclist             — Lihat daftar yang diban
 * .bcon / .bcoff      — Enable/disable broadcast
 * .bcstats            — Lihat statistik broadcast
 * .bcclear            — Reset subscriber & ban list (owner only)
 * .bcsubadd <@tag>    — Tambah subscriber manual
 * .bcsubdel <@tag>    — Hapus subscriber
 * .bcauto <on/off>    — Auto-subscribe user baru
 * .bcspam <on/off>    — Toggle anti-spam protection
 * .bcspamtime <detik> — Set cooldown anti-spam
 * .subscribe / .sub   — User subscribe ke broadcast
 * .unsubscribe / .unsub — User unsubscribe dari broadcast
 */

import config from "../../config.js";

// ===================== STATE =====================

const STATE = {
  enabled: true,
  autoSubscribe: true,
  antiSpam: true,
  spamCooldown: 30,
  subscribers: new Map(),
  banned: new Map(),
  lastBroadcast: null,
  stats: {
    totalBroadcasts: 0,
    totalSent: 0,
    totalFailed: 0,
    lastBroadcastTime: null,
  },
  userCooldowns: new Map(),
};

// ===================== HELPERS =====================

function getJid(m, text) {
  if (m.quoted) return m.quoted.sender;
  if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid[0];
  if (text) {
    let num = text.replace(/[^0-9]/g, "");
    if (num.startsWith("0")) num = "62" + num.slice(1);
    if (!num.startsWith("62")) num = "62" + num;
    return num + "@s.whatsapp.net";
  }
  return m.sender;
}

function isBanned(jid) {
  return STATE.banned.has(jid);
}

function isSubscribed(jid) {
  return STATE.subscribers.has(jid);
}

function checkSpam(jid) {
  if (!STATE.antiSpam) return { spam: false };
  const now = Date.now();
  const last = STATE.userCooldowns.get(jid) || 0;
  const diff = Math.floor((now - last) / 1000);
  if (diff < STATE.spamCooldown) {
    return { spam: true, remaining: STATE.spamCooldown - diff };
  }
  return { spam: false };
}

function formatJid(jid) {
  return jid.split("@")[0];
}

function formatList(map, title, emoji) {
  if (map.size === 0) return emoji + " *" + title + "*\n\nKosong — belum ada data.";
  let str = emoji + " *" + title + "* (" + map.size + ")\n\n";
  let i = 1;
  for (const [jid, data] of map) {
    const num = formatJid(jid);
    const name = data.name || num;
    const ts = data.joinedAt || data.bannedAt;
    const date = ts
      ? new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
      : "-";
    str += i++ + ". @" + num + " — " + name + " (" + date + ")\n";
  }
  return str.trim();
}

// ===================== MAIN HANDLER =====================

async function handler(m, { sock, db }) {
  const command = m.command;
  const args = m.text || "";
  const sender = m.sender;
  const isOwner = config.owner?.numbers?.some(
    (n) => m.sender?.startsWith(n) || m.sender === n + "@s.whatsapp.net"
  ) || false;

  // ===================== ENABLE / DISABLE =====================
  if (command === "bcon") {
    if (!isOwner) return m.reply("❌ Owner only");
    STATE.enabled = true;
    return m.reply("✅ *Broadcast System* telah *diaktifkan*!\n\nSemua subscriber akan menerima broadcast.");
  }

  if (command === "bcoff") {
    if (!isOwner) return m.reply("❌ Owner only");
    STATE.enabled = false;
    return m.reply("⛔ *Broadcast System* telah *dinonaktifkan*!\n\nTidak ada broadcast yang akan dikirim.");
  }

  // ===================== AUTO SUBSCRIBE =====================
  if (command === "bcauto") {
    if (!isOwner) return m.reply("❌ Owner only");
    const mode = args.toLowerCase().trim();
    if (mode === "on" || mode === "enable") {
      STATE.autoSubscribe = true;
      return m.reply("✅ *Auto-subscribe* aktif — User baru otomatis jadi subscriber.");
    } else if (mode === "off" || mode === "disable") {
      STATE.autoSubscribe = false;
      return m.reply("⛔ *Auto-subscribe* dinonaktifkan — User harus subscribe manual.");
    }
    return m.reply("Auto-subscribe saat ini: *" + (STATE.autoSubscribe ? "ON" : "OFF") + "*\n\nGunakan: .bcauto on/off");
  }

  // ===================== ANTI-SPAM =====================
  if (command === "bcspam") {
    if (!isOwner) return m.reply("❌ Owner only");
    const mode = args.toLowerCase().trim();
    if (mode === "on" || mode === "enable") {
      STATE.antiSpam = true;
      return m.reply("✅ *Anti-spam* aktif — Cooldown " + STATE.spamCooldown + "s per user.");
    } else if (mode === "off" || mode === "disable") {
      STATE.antiSpam = false;
      return m.reply("⛔ *Anti-spam* dinonaktifkan.");
    }
    return m.reply("Anti-spam saat ini: *" + (STATE.antiSpam ? "ON" : "OFF") + "*\n\nGunakan: .bcspam on/off");
  }

  if (command === "bcspamtime") {
    if (!isOwner) return m.reply("❌ Owner only");
    const sec = parseInt(args);
    if (!sec || sec < 5 || sec > 3600) {
      return m.reply("Cooldown anti-spam saat ini: *" + STATE.spamCooldown + "s*\n\nGunakan: .bcspamtime <detik> (5-3600)");
    }
    STATE.spamCooldown = sec;
    return m.reply("✅ Cooldown anti-spam diatur ke *" + sec + " detik*.");
  }

  // ===================== SUBSCRIBER LIST =====================
  if (command === "bcsub") {
    if (!isOwner) return m.reply("❌ Owner only");
    return m.reply(formatList(STATE.subscribers, "Subscriber List", "📋"));
  }

  // ===================== ADD SUBSCRIBER =====================
  if (command === "bcsubadd") {
    if (!isOwner) return m.reply("❌ Owner only");
    const targetJid = getJid(m, args);
    if (!targetJid) return m.reply("❌ Tag user atau masukkan nomor!\n\nContoh: .bcsubadd @user atau .bcsubadd 628xxx");

    if (isBanned(targetJid)) {
      return m.reply("⚠️ @" + formatJid(targetJid) + " ada di *ban list*! Unban dulu dengan .bcunban.");
    }
    if (isSubscribed(targetJid)) {
      return m.reply("ℹ️ @" + formatJid(targetJid) + " sudah menjadi subscriber.");
    }

    STATE.subscribers.set(targetJid, {
      jid: targetJid,
      name: args.includes("@") ? "Tagged User" : formatJid(targetJid),
      joinedAt: Date.now(),
      lastReceived: null,
      totalReceived: 0,
    });

    return m.reply("✅ @" + formatJid(targetJid) + " ditambahkan ke subscriber list!\n\nTotal subscriber: *" + STATE.subscribers.size + "*");
  }

  // ===================== DEL SUBSCRIBER =====================
  if (command === "bcsubdel") {
    if (!isOwner) return m.reply("❌ Owner only");
    const targetJid = getJid(m, args);
    if (!targetJid) return m.reply("❌ Tag user atau masukkan nomor!");
    if (!isSubscribed(targetJid)) {
      return m.reply("ℹ️ @" + formatJid(targetJid) + " bukan subscriber.");
    }
    STATE.subscribers.delete(targetJid);
    return m.reply("✅ @" + formatJid(targetJid) + " dihapus dari subscriber list!\n\nTotal subscriber: *" + STATE.subscribers.size + "*");
  }

  // ===================== BAN USER =====================
  if (command === "bcban") {
    if (!isOwner) return m.reply("❌ Owner only");
    const parts = args.split(" ");
    const targetJid = getJid(m, parts[0]);
    const reason = parts.slice(1).join(" ") || "Tidak ada alasan";
    if (!targetJid) return m.reply("❌ Tag user atau masukkan nomor!\n\nContoh: .bcban @user spamming");
    if (isBanned(targetJid)) {
      return m.reply("ℹ️ @" + formatJid(targetJid) + " sudah di-ban.");
    }

    STATE.banned.set(targetJid, {
      jid: targetJid,
      name: formatJid(targetJid),
      bannedAt: Date.now(),
      reason,
    });

    if (isSubscribed(targetJid)) {
      STATE.subscribers.delete(targetJid);
    }

    return m.reply("⛔ @" + formatJid(targetJid) + " di-ban dari broadcast!\nAlasan: " + reason + "\n\nTotal banned: *" + STATE.banned.size + "*");
  }

  // ===================== UNBAN USER =====================
  if (command === "bcunban") {
    if (!isOwner) return m.reply("❌ Owner only");
    const targetJid = getJid(m, args);
    if (!targetJid) return m.reply("❌ Tag user atau masukkan nomor!");
    if (!isBanned(targetJid)) {
      return m.reply("ℹ️ @" + formatJid(targetJid) + " tidak di-ban.");
    }
    STATE.banned.delete(targetJid);
    return m.reply("✅ @" + formatJid(targetJid) + " di-unban! Bisa menerima broadcast lagi.");
  }

  // ===================== BAN LIST =====================
  if (command === "bclist") {
    if (!isOwner) return m.reply("❌ Owner only");
    return m.reply(formatList(STATE.banned, "Banned List", "🚫"));
  }

  // ===================== BROADCAST STATS =====================
  if (command === "bcstats") {
    if (!isOwner) return m.reply("❌ Owner only");
    const lastTime = STATE.stats.lastBroadcastTime
      ? new Date(STATE.stats.lastBroadcastTime).toLocaleString("id-ID")
      : "Belum pernah";
    const totalAttempts = STATE.stats.totalSent + STATE.stats.totalFailed;
    const successRate = totalAttempts > 0
      ? Math.round((STATE.stats.totalSent / totalAttempts) * 100)
      : 0;

    const text = "📊 *Broadcast Statistics*\n\n" +
      "◈ Status: *" + (STATE.enabled ? "ON" : "OFF") + "*\n" +
      "◈ Auto-subscribe: *" + (STATE.autoSubscribe ? "ON" : "OFF") + "*\n" +
      "◈ Anti-spam: *" + (STATE.antiSpam ? "ON" : "OFF") + "* (cooldown: " + STATE.spamCooldown + "s)\n\n" +
      "◈ Total Subscriber: *" + STATE.subscribers.size + "*\n" +
      "◈ Total Banned: *" + STATE.banned.size + "*\n\n" +
      "◈ Total Broadcast: *" + STATE.stats.totalBroadcasts + "*\n" +
      "◈ Total Terkirim: *" + STATE.stats.totalSent + "*\n" +
      "◈ Total Gagal: *" + STATE.stats.totalFailed + "*\n" +
      "◈ Success Rate: *" + successRate + "%*\n" +
      "◈ Last Broadcast: *" + lastTime + "*";

    return m.reply(text);
  }

  // ===================== CLEAR ALL =====================
  if (command === "bcclear") {
    if (!isOwner) return m.reply("❌ Owner only");
    STATE.subscribers.clear();
    STATE.banned.clear();
    STATE.userCooldowns.clear();
    STATE.stats = {
      totalBroadcasts: 0,
      totalSent: 0,
      totalFailed: 0,
      lastBroadcastTime: null,
    };
    return m.reply("✅ Semua data broadcast direset!\n- Subscriber list dibersihkan\n- Ban list dibersihkan\n- Stats direset");
  }

  // ===================== BROADCAST SEND =====================
  if (command === "broadcast" || command === "bc") {
    if (!isOwner) return m.reply("❌ Owner only");
    if (!STATE.enabled) return m.reply("⛔ Broadcast system sedang *OFF*. Gunakan .bcon untuk mengaktifkan.");
    if (STATE.subscribers.size === 0) return m.reply("⚠️ Belum ada subscriber! Gunakan .bcsubadd untuk menambah.");

    const spamCheck = checkSpam(sender);
    if (spamCheck.spam) {
      return m.reply("⏳ Anti-spam aktif! Tunggu *" + spamCheck.remaining + "s* lagi sebelum broadcast berikutnya.");
    }

    let broadcastText = args.trim();
    let mediaType = null;
    let mediaData = null;

    // Cek apakah ada media (quoted message)
    if (m.quoted) {
      const q = m.quoted;
      if (q.mtype === "imageMessage" || q.mtype === "videoMessage" || q.mtype === "documentMessage" || q.mtype === "audioMessage") {
        mediaType = q.mtype;
        try {
          mediaData = await q.download();
        } catch (e) {
          // Fallback: text only
        }
      }
      if (!broadcastText && q.text) {
        broadcastText = q.text;
      }
    }

    if (!broadcastText && !mediaData) {
      return m.reply(
        "📢 *Cara Broadcast*\n\n" +
        "Ketik pesan atau reply media:\n" +
        ".broadcast <pesan>\n\n" +
        "Atau reply gambar/video dengan:\n" +
        ".broadcast <caption>\n\n" +
        "Stats: *" + STATE.subscribers.size + "* subscriber | *" + STATE.banned.size + "* banned"
      );
    }

    STATE.userCooldowns.set(sender, Date.now());

    const header = "📢 *BROADCAST*\n\n";
    const footer = "\n\n_" + (config.bot?.name || "Bot") + " • " + new Date().toLocaleString("id-ID") + "_";
    const fullText = header + (broadcastText || "") + footer;

    await m.reply("⏳ Mengirim broadcast ke *" + STATE.subscribers.size + "* subscriber...");

    let sent = 0;
    let failed = 0;
    const failedList = [];

    for (const [jid, subData] of STATE.subscribers) {
      try {
        if (isBanned(jid)) continue;

        if (mediaData && mediaType) {
          const mediaMsg = {};
          if (mediaType === "imageMessage") {
            mediaMsg.image = mediaData;
            mediaMsg.caption = fullText;
          } else if (mediaType === "videoMessage") {
            mediaMsg.video = mediaData;
            mediaMsg.caption = fullText;
          } else if (mediaType === "documentMessage") {
            mediaMsg.document = mediaData;
            mediaMsg.caption = fullText;
            mediaMsg.fileName = "Broadcast.pdf";
          } else if (mediaType === "audioMessage") {
            mediaMsg.audio = mediaData;
            mediaMsg.ptt = true;
            mediaMsg.mimetype = "audio/mpeg";
          }
          await sock.sendMessage(jid, mediaMsg);
        } else {
          await sock.sendMessage(jid, { text: fullText });
        }

        sent++;
        subData.lastReceived = Date.now();
        subData.totalReceived = (subData.totalReceived || 0) + 1;

        // Delay kecil untuk menghindari rate-limit
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        failed++;
        failedList.push(formatJid(jid));

        // Hapus subscriber yang nomornya tidak valid / blokir
        if (err.message?.includes("404") || err.message?.includes("not-found") || err.message?.includes("Not Found")) {
          STATE.subscribers.delete(jid);
        }
      }
    }

    STATE.stats.totalBroadcasts++;
    STATE.stats.totalSent += sent;
    STATE.stats.totalFailed += failed;
    STATE.stats.lastBroadcastTime = Date.now();
    STATE.lastBroadcast = Date.now();

    let report = "✅ *Broadcast Selesai*\n\n";
    report += "◈ Terkirim: *" + sent + "*\n";
    report += "◈ Gagal: *" + failed + "*\n";
    report += "◈ Sisa Subscriber: *" + STATE.subscribers.size + "*\n";

    if (failedList.length > 0 && failedList.length <= 10) {
      report += "\n⚠️ Gagal ke: " + failedList.join(", ");
    }

    return m.reply(report);
  }

  // ===================== SUBSCRIBE (User Command) =====================
  if (command === "subscribe" || command === "sub") {
    const senderJid = m.sender;

    if (isBanned(senderJid)) {
      return m.reply("⛔ Kamu di-ban dari broadcast system!\nHubungi owner untuk informasi lebih lanjut.");
    }
    if (isSubscribed(senderJid)) {
      return m.reply("ℹ️ Kamu sudah terdaftar sebagai subscriber!");
    }

    STATE.subscribers.set(senderJid, {
      jid: senderJid,
      name: m.pushName || formatJid(senderJid),
      joinedAt: Date.now(),
      lastReceived: null,
      totalReceived: 0,
    });

    return m.reply("✅ Kamu berhasil *subscribe* broadcast!\n\nKamu akan menerima broadcast dari " + (config.bot?.name || "Bot") + ".\n\nKetik .unsubscribe untuk berhenti.");
  }

  // ===================== UNSUBSCRIBE (User Command) =====================
  if (command === "unsubscribe" || command === "unsub") {
    const senderJid = m.sender;
    if (!isSubscribed(senderJid)) {
      return m.reply("ℹ️ Kamu belum terdaftar sebagai subscriber.");
    }
    STATE.subscribers.delete(senderJid);
    return m.reply("✅ Kamu berhasil *unsubscribe* dari broadcast.\nKamu tidak akan menerima broadcast lagi.");
  }

  return { handled: false };
}

// ===================== EXPORTS =====================

export function autoSubscribeUser(jid, pushName) {
  if (!STATE.autoSubscribe || !STATE.enabled) return;
  if (isBanned(jid) || isSubscribed(jid)) return;
  STATE.subscribers.set(jid, {
    jid,
    name: pushName || formatJid(jid),
    joinedAt: Date.now(),
    lastReceived: null,
    totalReceived: 0,
  });
}

export function getBroadcastState() {
  return {
    enabled: STATE.enabled,
    subscriberCount: STATE.subscribers.size,
    bannedCount: STATE.banned.size,
    stats: { ...STATE.stats },
  };
}

const pluginConfig = {
  name: "broadcast",
  alias: [
    "bc", "bcon", "bcoff", "bcauto",
    "bcspam", "bcspamtime",
    "bcsub", "bcsubadd", "bcsubdel",
    "bcban", "bcunban", "bclist",
    "bcstats", "bcclear",
    "subscribe", "unsubscribe", "sub", "unsub",
  ],
  category: "owner",
  description: "Sistem broadcast ke saluran dengan enable/disable, subscriber, ban, anti-spam & stats",
  usage: ".broadcast <pesan> | .bcon | .bcoff | .bcsub | .bcban <nomor> | .bcstats",
  example: ".broadcast Pengumuman: maintenance jam 00:00",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
