// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Auto Jobs — Lowongan Kerja Otomatis
 * ---------------------------------------------------------------
 * Kirim daftar lowongan kerja otomatis dari API gratis (RemoteOK + Jobicyde).
 * Kirim dengan thumbnail preview + plain text daftar lowongan.
 *
 * Commands:
 * .autojobs / .aj       — Lihat status & pengaturan
 * .aj on / .aj off      — Toggle auto-jobs
 * .aj jadwal            — Lihat jadwal
 * .aj set <jam>         — Set jam pengiriman (contoh: .aj set 08:00)
 * .aj kategori <kat>    — Filter kategori (contoh: .aj kategori tech)
 * .aj limit <jumlah>    — Jumlah lowongan per kirim (default 5, max 10)
 * .aj test              — Test kirim lowongan sekarang
 * .aj target            — Set chat tujuan
 * .aj reset             — Reset ke default
 */

import config from "../../config.js";

// ===================== STATE =====================

const STATE = {
  enabled: false,
  scheduleTime: "08:00",
  targetChat: null,
  category: "",
  limit: 5,
  lastSent: null,
  timer: null,
};

// ===================== HELPERS =====================

function isOwner(m) {
  return config.owner?.numbers?.some(
    (n) => m.sender?.startsWith(n) || m.sender === n + "@s.whatsapp.net"
  ) || false;
}

function secondsUntil(timeStr) {
  const now = new Date();
  const [h, m] = timeStr.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.max(1, Math.round((target - now) / 1000));
}

function stripHtml(text) {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "..." : text;
}

// ===================== JOB APIs =====================

async function fetchRemoteOK(category, limit) {
  try {
    const url = "https://remoteok.com/api";
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    let jobs = data.slice(1); // skip first item (meta)
    if (category) {
      const cat = category.toLowerCase();
      jobs = jobs.filter(j =>
        (j.tags || []).some(t => t.toLowerCase().includes(cat)) ||
        (j.position || "").toLowerCase().includes(cat)
      );
    }
    return jobs.slice(0, limit).map(j => ({
      title: j.position || "Unknown",
      company: j.company || "Unknown",
      url: j.url || "",
      logo: j.company_logo || "",
      tags: (j.tags || []).slice(0, 5),
      salary: j.salary_min ? "$" + j.salary_min : "",
      location: j.location || "Remote",
      type: "Remote",
      source: "RemoteOK",
    }));
  } catch (e) {
    console.error("[AutoJobs] RemoteOK error: " + e.message);
    return [];
  }
}

async function fetchJobicyde(category, limit) {
  try {
    const url = "https://jobicy.com/api/v2/remote-jobs" + (category ? "?industry=" + encodeURIComponent(category) : "");
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = data.jobs || [];
    return jobs.slice(0, limit).map(j => ({
      title: j.jobTitle || "Unknown",
      company: j.companyName || "Unknown",
      url: j.url || "",
      logo: j.companyLogo || "",
      tags: (j.jobIndustry || []).concat(j.jobType || []).slice(0, 5),
      salary: j.salaryRange || "",
      location: j.jobRegion || "Remote",
      type: (j.jobType || []).join(", ") || "Remote",
      source: "Jobicyde",
    }));
  } catch (e) {
    console.error("[AutoJobs] Jobicyde error: " + e.message);
    return [];
  }
}

async function fetchJobs(category, limit) {
  const [remoteOk, jobicyde] = await Promise.all([
    fetchRemoteOK(category, limit),
    fetchJobicyde(category, limit),
  ]);

  // Gabung & acak agar variatif
  const all = [...remoteOk, ...jobicyde];
  return all.slice(0, limit);
}

// ===================== FORMAT =====================

function formatJobsMessage(jobs) {
  if (jobs.length === 0) {
    return "📭 Tidak ada lowongan ditemukan saat ini.";
  }

  let text = "💼 *LOWONGAN KERJA TERBARU*\n\n";
  text += "🗓️ " + new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) + "\n";
  text += "━━━━━━━━━━━━━━━━━━\n\n";

  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    text += (i + 1) + ". *" + truncate(j.title, 60) + "*\n";
    text += "   🏢 " + truncate(j.company, 40) + "\n";
    text += "   📍 " + j.location + (j.type ? " | " + j.type : "") + "\n";
    if (j.salary) text += "   💰 " + j.salary + "\n";
    if (j.tags && j.tags.length > 0) {
      text += "   🏷️ " + j.tags.map(t => "#" + t.replace(/\s+/g, "_")).join(" ") + "\n";
    }
    if (j.url) text += "   🔗 " + truncate(j.url, 80) + "\n";
    text += "\n";
  }

  text += "━━━━━━━━━━━━━━━━━━\n";
  text += "📡 Sumber: RemoteOK + Jobicyde API\n";
  text += "🤖 Auto Jobs • " + (config.bot?.name || "Bot");
  return text;
}

// ===================== THUMBNAIL =====================

async function generateJobsThumbnail(sock, jobs) {
  try {
    // Ambil logo pertama yang ada
    let logoUrl = "";
    for (const j of jobs) {
      if (j.logo) { logoUrl = j.logo; break; }
    }

    if (logoUrl) {
      // Download thumbnail
      const res = await fetch(logoUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        return buf;
      }
    }
  } catch (e) {
    // Fallback: no thumbnail
  }
  return null;
}

// ===================== SEND =====================

async function sendJobs(sock, targetChat) {
  try {
    const jobs = await fetchJobs(STATE.category, STATE.limit);
    if (jobs.length === 0) return;

    const text = formatJobsMessage(jobs);

    // Coba kirim dengan thumbnail
    let thumbnail = await generateJobsThumbnail(sock, jobs);
    if (thumbnail) {
      try {
        await sock.sendMessage(targetChat, {
          image: thumbnail,
          caption: text,
          mimetype: "image/jpeg",
        });
      } catch (e) {
        // Fallback: text only
        await sock.sendMessage(targetChat, { text });
      }
    } else {
      await sock.sendMessage(targetChat, { text });
    }

    STATE.lastSent = Date.now();
  } catch (err) {
    console.error("[AutoJobs] Failed send: " + err.message);
  }
}

function setupTimer(sock) {
  if (STATE.timer) clearTimeout(STATE.timer);

  if (!STATE.enabled || !STATE.targetChat) return;

  const scheduleNext = () => {
    const secs = secondsUntil(STATE.scheduleTime);
    STATE.timer = setTimeout(async () => {
      await sendJobs(sock, STATE.targetChat);
      scheduleNext();
    }, secs * 1000);
  };

  scheduleNext();
}

// ===================== HANDLER =====================

async function handler(m, { sock, db }) {
  const command = m.command;
  const args = (m.text || "").trim();
  const owner = isOwner(m);

  if (command === "aj" || command === "autojobs") {
    if (!args) {
      let text = "💼 *Auto Jobs System*\n\n";
      text += "◈ Status: *" + (STATE.enabled ? "ON ✅" : "OFF ⛔") + "*\n";
      text += "◈ Jadwal: *" + STATE.scheduleTime + "* (Asia/Jakarta)\n";
      text += "◈ Kategori: " + (STATE.category || "Semua") + "\n";
      text += "◈ Limit: *" + STATE.limit + "* lowongan/kirim\n";
      text += "◈ Target: " + (STATE.targetChat || "Belum diset") + "\n";
      text += "◈ Last Sent: " + (STATE.lastSent ? new Date(STATE.lastSent).toLocaleString("id-ID") : "Belum pernah") + "\n\n";
      text += "📋 *Commands:*\n";
      text += ".aj on/off — Toggle\n";
      text += ".aj set <jam> — Set jam kirim\n";
      text += ".aj kategori <kat> — Filter kategori\n";
      text += ".aj limit <jumlah> — Jumlah lowongan\n";
      text += ".aj target — Set chat tujuan\n";
      text += ".aj test — Test kirim sekarang\n";
      text += ".aj reset — Reset ke default";
      return m.reply(text);
    }

    const sub = args.toLowerCase().split(" ")[0];
    const rest = args.slice(sub.length).trim();

    // ===================== ON / OFF =====================
    if (sub === "on" || sub === "enable") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.enabled = true;
      if (!STATE.targetChat) STATE.targetChat = m.chat;
      setupTimer(sock);
      return m.reply("✅ *Auto Jobs* diaktifkan!\n\nJadwal: *" + STATE.scheduleTime + "*\nLimit: " + STATE.limit + " lowongan/kirim\nTarget: " + STATE.targetChat);
    }

    if (sub === "off" || sub === "disable") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.enabled = false;
      if (STATE.timer) clearTimeout(STATE.timer);
      STATE.timer = null;
      return m.reply("⛔ *Auto Jobs* dinonaktifkan.");
    }

    // ===================== SET TIME =====================
    if (sub === "set") {
      if (!owner) return m.reply("❌ Owner only");
      if (!rest || !/^\d{2}:\d{2}$/.test(rest)) {
        return m.reply("❌ Format jam tidak valid! Gunakan HH:MM\n\nContoh: .aj set 08:00");
      }
      const [h, mn] = rest.split(":").map(Number);
      if (h > 23 || mn > 59) return m.reply("❌ Jam tidak valid!");
      STATE.scheduleTime = rest;
      if (STATE.enabled) setupTimer(sock);
      return m.reply("✅ Jadwal pengiriman diatur ke *" + rest + "* WIB");
    }

    // ===================== KATEGORI =====================
    if (sub === "kategori" || sub === "category") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.category = rest || "";
      return m.reply("✅ Kategori diatur ke: *" + (rest || "Semua") + "*\n\nContoh kategori: tech, design, marketing, sales, finance, dev");
    }

    // ===================== LIMIT =====================
    if (sub === "limit") {
      if (!owner) return m.reply("❌ Owner only");
      const n = parseInt(rest);
      if (!n || n < 1 || n > 10) {
        return m.reply("❌ Jumlah tidak valid! (1-10)\n\nContoh: .aj limit 5");
      }
      STATE.limit = n;
      return m.reply("✅ Limit diatur ke *" + n + "* lowongan per kirim.");
    }

    // ===================== TARGET =====================
    if (sub === "target") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.targetChat = m.chat;
      if (STATE.enabled) setupTimer(sock);
      const isGroup = m.chat.endsWith("@g.us");
      return m.reply("✅ Target pengiriman: *" + (isGroup ? "Grup ini" : "Chat ini") + "*\n\nID: " + m.chat);
    }

    // ===================== TEST =====================
    if (sub === "test" || sub === "now") {
      if (!owner) return m.reply("❌ Owner only");
      await m.reply("⏳ Mengambil lowongan kerja terbaru...");
      try {
        const jobs = await fetchJobs(STATE.category, STATE.limit);
        if (jobs.length === 0) return m.reply("📭 Tidak ada lowongan ditemukan.");

        const text = formatJobsMessage(jobs);

        // Coba dengan thumbnail
        let thumbnail = await generateJobsThumbnail(sock, jobs);
        if (thumbnail) {
          try {
            await sock.sendMessage(m.chat, {
              image: thumbnail,
              caption: text,
              mimetype: "image/jpeg",
            }, { quoted: m });
          } catch (e) {
            await m.reply(text);
          }
        } else {
          await m.reply(text);
        }
        return { handled: true };
      } catch (err) {
        return m.reply("❌ Gagal: " + err.message);
      }
    }

    // ===================== JADWAL =====================
    if (sub === "jadwal" || sub === "schedule") {
      let text = "⏰ *Jadwal Auto Jobs*\n\n";
      text += "◈ Jam: *" + STATE.scheduleTime + "* WIB\n";
      text += "◈ Status: " + (STATE.enabled ? "Aktif ✅" : "Nonaktif ⛔") + "\n";
      text += "◈ Kategori: " + (STATE.category || "Semua") + "\n";
      text += "◈ Limit: " + STATE.limit + " lowongan/kirim\n";
      if (STATE.lastSent) {
        text += "◈ Last Sent: " + new Date(STATE.lastSent).toLocaleString("id-ID");
      }
      return m.reply(text);
    }

    // ===================== RESET =====================
    if (sub === "reset") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.scheduleTime = "08:00";
      STATE.category = "";
      STATE.limit = 5;
      if (STATE.enabled) setupTimer(sock);
      return m.reply("✅ Reset ke default:\n• Jadwal: 08:00 WIB\n• Kategori: Semua\n• Limit: 5 lowongan");
    }

    return m.reply("❌ Sub-command tidak dikenal. Ketik .aj untuk bantuan.");
  }

  return { handled: false };
}

// ===================== PLUGIN CONFIG =====================

const pluginConfig = {
  name: "autojobs",
  alias: ["aj", "autolowongan", "lowongankrj"],
  category: "owner",
  description: "Auto kirim lowongan kerja dari RemoteOK + Jobicyde API dengan thumbnail preview",
  usage: ".aj | .aj on/off | .aj set <jam> | .aj kategori <kat> | .aj limit <n> | .aj test",
  example: ".aj on\n.aj set 08:00\n.aj kategori tech\n.aj limit 5",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

// ===================== EXPORT =====================

export function initAutoJobs(sock) {
  if (STATE.enabled && STATE.targetChat) {
    setupTimer(sock);
  }
}

export function getAutoJobsState() {
  return {
    enabled: STATE.enabled,
    scheduleTime: STATE.scheduleTime,
    category: STATE.category,
    limit: STATE.limit,
    targetChat: STATE.targetChat,
    lastSent: STATE.lastSent,
  };
}

export default { config: pluginConfig, handler };
