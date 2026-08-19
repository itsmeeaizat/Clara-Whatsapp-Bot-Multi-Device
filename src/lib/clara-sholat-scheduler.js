// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import { getDatabase } from "./clara-database.js";
import { saluranCtx } from "./clara-context.js";

const TZ = "Asia/Jakarta";
const ADVANCE_REMINDER_MINUTES = 5;
const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = {
  Fajr: "Subuh",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};
const PRAYER_EMOJIS = {
  Fajr: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌙",
};
const IQAMAH_OFFSET_MINUTES = {
  Fajr: 5,
  Dhuhr: 10,
  Asr: 5,
  Maghrib: 5,
  Isha: 10,
};

let sholatSock = null;
let sholatJob = null;
let lastNotified = new Map();
const cityCache = new Map();

function addMinutes(time24, minutesToAdd) {
  if (!time24 || time24 === "-") return "-";
  const [hour, minute] = String(time24).split(":").map(Number);
  const now = new Date();
  now.setHours(hour, minute, 0, 0);
  now.setMinutes(now.getMinutes() + minutesToAdd);
  return now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatTime24(time24) {
  if (!time24) return "-";
  const [hour, minute] = String(time24).split(":").map(Number);
  const now = new Date();
  now.setHours(hour, minute, 0, 0);
  return now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

async function fetchPrayerTimes(city) {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Indonesia&method=20`;
  const response = await axios.get(url, { timeout: 10000 });
  const data = response.data;
  if (data?.code !== 200 || !data?.data?.timings) {
    throw new Error("Gagal mengambil jadwal sholat dari API");
  }
  return data.data.timings;
}

function buildReminderText(next) {
  if (next.remainingMinutes <= ADVANCE_REMINDER_MINUTES) {
    return `⏰ *WAKTU SHOLAT SUDAH TIBA*\n\nAyo sholat *${next.emoji} ${next.label}* sekarang!\nJangan sampai tertunda.`;
  }
  return `🔔 *PENGINGAT SHOLAT*\n\n${next.emoji} *${next.label}* tinggal *${next.remainingMinutes} menit* lagi.\nSiap-siap wudhu dan sholat tepat waktu.`;
}

function buildPrayerMessage(city, timings, next) {
  const reminderText = buildReminderText(next);
  const prayerLines = PRAYER_KEYS.map((key) => {
    const label = PRAYER_LABELS[key] || key;
    const emoji = PRAYER_EMOJIS[key] || "🕌";
    return `${emoji} ${label}: *${formatTime24(timings[key])}*`;
  });
  const iqamahLines = PRAYER_KEYS.map((key) => {
    const label = PRAYER_LABELS[key] || key;
    const emoji = PRAYER_EMOJIS[key] || "🕌";
    const adzan = formatTime24(timings[key]);
    const iqamah = addMinutes(timings[key], IQAMAH_OFFSET_MINUTES[key] ?? 5);
    return `${emoji} ${label}: *${adzan}* ➜ *${iqamah}*`;
  });

  return (
    `🕌 *Auto Sholat - ${city}*\n\n` +
    reminderText +
    `\n\n` +
    `────────────────────\n` +
    `🕋 *Jadwal Adzan*\n` +
    prayerLines.join("\n") +
    `\n\n` +
    `────────────────────\n` +
    `📿 *Jadwal Iqamah/Jamaah*\n` +
    iqamahLines.join("\n") +
    `\n\n` +
    `────────────────────\n` +
    `🤲 *Info:*\n` +
    `• Reminder 5 menit sebelum sholat\n` +
    `• Notifikasi otomatis saat waktu sholat\n` +
    `• Sumber: Aladhan API (Kemenag RI)\n` +
    `• Auto refresh setiap hari`
  );
}

async function refreshCity(city) {
  try {
    const timings = await fetchPrayerTimes(city);
    cityCache.set(city, { timings, updatedAt: Date.now() });
    return timings;
  } catch {
    return cityCache.get(city)?.timings || null;
  }
}

async function notifyTargets(sock, city, timings) {
  const db = getDatabase();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const notifiedTargets = [];

  const groups = db.getAllGroups?.() || {};
  for (const [groupId, group] of Object.entries(groups)) {
    if (group?.sholat?.enabled && group?.sholat?.city === city && group?.sholat?.notifyGroup !== false) {
      notifiedTargets.push(groupId);
    }
  }

  const users = db.getAllUsers?.() || {};
  for (const [userId, user] of Object.entries(users)) {
    if (user?.sholat?.enabled && user?.sholat?.city === city && user?.sholat?.notifyPrivate !== false) {
      const jid = `${userId}@s.whatsapp.net`;
      notifiedTargets.push(jid);
    }
  }

  if (notifiedTargets.length === 0) return;

  for (const key of PRAYER_KEYS) {
    const time = timings[key];
    if (!time) continue;
    const [h, m] = String(time).split(":").map(Number);
    const targetMinutes = h * 60 + m;

    if (targetMinutes > currentMinutes || targetMinutes <= currentMinutes - 2) continue;

    const notifyKey = `${city}_${key}_${now.toDateString()}`;
    if (lastNotified.has(notifyKey)) continue;
    lastNotified.add(notifyKey);

    const next = {
      key,
      label: PRAYER_LABELS[key],
      emoji: PRAYER_EMOJIS[key],
      time,
      targetMinutes,
      remainingMinutes: 0,
    };

    const message = buildPrayerMessage(city, timings, next);

    for (const targetId of notifiedTargets) {
      try {
        await sock.sendMessage(targetId, {
          text: message,
          contextInfo: saluranCtx(),
        }).catch(() => {});
      } catch {}
    }
  }
}

async function checkAll(sock) {
  if (!sock) return;

  const db = getDatabase();
  const groups = db.getAllGroups?.() || {};
  const users = db.getAllUsers?.() || {};
  const cities = new Set();

  for (const group of Object.values(groups)) {
    if (group?.sholat?.enabled && group?.sholat?.city) {
      cities.add(group.sholat.city);
    }
  }

  for (const user of Object.values(users)) {
    if (user?.sholat?.enabled && user?.sholat?.city) {
      cities.add(user.sholat.city);
    }
  }

  if (cities.size === 0) return;

  const shouldRefresh =
    !cityCache.size ||
    Array.from(cityCache.values()).some((c) => Date.now() - c.updatedAt > 12 * 60 * 60 * 1000);

  if (shouldRefresh) {
    cityCache.clear();
    await Promise.allSettled(Array.from(cities).map((city) => refreshCity(city)));
  } else {
    for (const city of cities) {
      if (!cityCache.has(city)) {
        await refreshCity(city);
      }
    }
  }

  for (const city of cities) {
    const entry = cityCache.get(city);
    if (!entry?.timings) continue;
    await notifyTargets(sock, city, entry.timings);
  }
}

async function startSholatChecker(sock) {
  if (sholatJob) {
    sholatJob.stop();
    sholatJob = null;
  }

  sholatSock = sock;
  lastNotified.clear();

  const db = getDatabase();
  const groups = db.getAllGroups?.() || {};
  const users = db.getAllUsers?.() || {};
  const cities = new Set();
  const targets = [];

  for (const [groupId, group] of Object.entries(groups)) {
    if (group?.sholat?.enabled && group?.sholat?.city) {
      cities.add(group.sholat.city);
      targets.push({ type: "grup", id: groupId, city: group.sholat.city, permission: group.sholat.permission });
    }
  }

  for (const [userId, user] of Object.entries(users)) {
    if (user?.sholat?.enabled && user?.sholat?.city) {
      cities.add(user.sholat.city);
      targets.push({ type: "pribadi", id: `${userId}@s.whatsapp.net`, city: user.sholat.city });
    }
  }

  if (cities.size === 0) {
    return { started: false, reason: "Belum ada grup atau user yang mengaktifkan auto sholat", targets: [] };
  }

  await Promise.allSettled(Array.from(cities).map((city) => refreshCity(city)));

  sholatJob = new CronJob(
    "*/1 * * * *",
    async () => {
      if (!sholatSock) return;
      try {
        await checkAll(sholatSock);
      } catch {}
    },
    null,
    true,
    TZ,
  );

  return { started: true, cities: Array.from(cities), targets };
}

function stopSholatChecker() {
  if (sholatJob) {
    sholatJob.stop();
    sholatJob = null;
  }
  sholatSock = null;
  lastNotified.clear();
}

function getSholatStatus() {
  const db = getDatabase();
  const groups = db.getAllGroups?.() || {};
  const users = db.getAllUsers?.() || {};
  const cities = new Set();
  const targets = [];

  for (const [groupId, group] of Object.entries(groups)) {
    if (group?.sholat?.enabled && group?.sholat?.city) {
      cities.add(group.sholat.city);
      targets.push({ type: "grup", id: groupId, city: group.sholat.city });
    }
  }

  for (const [userId, user] of Object.entries(users)) {
    if (user?.sholat?.enabled && user?.sholat?.city) {
      cities.add(user.sholat.city);
      targets.push({ type: "pribadi", id: `${userId}@s.whatsapp.net`, city: user.sholat.city });
    }
  }

  return {
    running: !!sholatJob,
    cities: Array.from(cities),
    cacheSize: cityCache.size,
    targets,
  };
}

async function initSholatScheduler(sock) {
  if (!sock) return { started: false, reason: "Socket belum siap" };

  try {
    const result = await startSholatChecker(sock);
    if (result?.started) {
      console.log(`[SHOLAT] Scheduler aktif: ${result.cities.join(", ")} | ${result.targets.length} target terhubung`);
      for (const t of result.targets) {
        console.log(`[SHOLAT] - ${t.type}: ${t.id} (${t.city})`);
      }
    }
    return result;
  } catch (e) {
    console.log(`[SHOLAT] Gagal start: ${e.message}`);
    return { started: false, reason: e.message };
  }
}

export {
  startSholatChecker,
  stopSholatChecker,
  getSholatStatus,
  initSholatScheduler,
  fetchPrayerTimes,
  buildPrayerMessage,
  checkAll,
  PRAYER_KEYS,
  PRAYER_LABELS,
  PRAYER_EMOJIS,
  IQAMAH_OFFSET_MINUTES,
  ADVANCE_REMINDER_MINUTES,
};
