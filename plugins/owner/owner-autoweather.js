/**
 * Auto Weather — Scheduled Weather Broadcast
 * ---------------------------------------------------------------
 * Kirim info cuaca otomatis 4x sehari (pagi, siang, sore, malam)
 * menggunakan API Open-Meteo (gratis, tanpa API key).
 *
 * Commands:
 * .autoweather         — Lihat status & pengaturan
 * .aw                   — Alias
 * .aw on / .aw off      — Toggle auto-weather
 * .aw lokasi <kota>     — Set lokasi default (contoh: .aw lokasi Jakarta)
 * .aw jadwal            — Lihat jadwal pengiriman
 * .aw set <waktu> <jam> — Ubah jam pengiriman (contoh: .aw set pagi 07:00)
 * .aw toggle <waktu>   — On/off per sesi (contoh: .aw toggle pagi)
 * .aw test             — Test kirim cuaca sekarang
 * .aw reset            — Reset ke default
 *
 * Sesi: pagi, siang, sore, malam
 * Default: 06:00, 12:00, 15:00, 19:00 (Asia/Jakarta)
 */

import config from "../../config.js";

// ===================== STATE =====================

const DEFAULT_SCHEDULE = {
  pagi:  { enabled: true,  time: "06:00", greeting: "🌅 Selamat pagi" },
  siang: { enabled: true,  time: "12:00", greeting: "☀️ Selamat siang" },
  sore:  { enabled: true,  time: "15:00", greeting: "🌇 Selamat sore" },
  malam: { enabled: true,  time: "19:00", greeting: "🌙 Selamat malam" },
};

const STATE = {
  enabled: false,
  location: "Jakarta",
  lat: -6.2088,
  lon: 106.8456,
  timezone: "Asia/Jakarta",
  schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)),
  targetChat: null, // chat tujuan (grup/PM owner)
  lastSent: {},
  timers: new Map(), // session -> setTimeout id
};

// ===================== HELPERS =====================

function isOwner(m) {
  return config.owner?.numbers?.some(
    (n) => m.sender?.startsWith(n) || m.sender === n + "@s.whatsapp.net"
  ) || false;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesUntil(targetTime) {
  const now = new Date();
  const [h, m] = targetTime.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.round((target - now) / 60000);
}

function secondsUntil(targetTime) {
  const now = new Date();
  const [h, m] = targetTime.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.max(1, Math.round((target - now) / 1000));
}

// ===================== WEATHER API =====================

async function getWeatherData(lat, lon, timezone) {
  // Open-Meteo API (gratis, tanpa API key)
  const url = "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + lat + "&longitude=" + lon +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max,sunrise,sunset" +
    "&timezone=" + encodeURIComponent(timezone) +
    "&forecast_days=1";

  const res = await fetch(url);
  if (!res.ok) throw new Error("API error: " + res.status);
  const data = await res.json();
  return data;
}

async function getCoordinates(cityName) {
  // Open-Meteo Geocoding API
  const url = "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(cityName) + "&count=1&language=id&format=json";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding error: " + res.status);
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("Lokasi tidak ditemukan: " + cityName);
  }
  const r = data.results[0];
  return {
    name: r.name,
    country: r.country || "",
    admin1: r.admin1 || "",
    lat: r.latitude,
    lon: r.longitude,
  };
}

function weatherCodeToString(code) {
  const map = {
    0: "Cerah ☀️",
    1: "Hampir Cerah 🌤️",
    2: "Berawan Sebagian ⛅",
    3: "Mendung ☁️",
    45: "Berkabut 🌫️",
    48: "Berkabut Beku 🌫️",
    51: "Gerimis Ringan 🌦️",
    53: "Gerimis Sedang 🌦️",
    55: "Gerimis Lebat 🌦️",
    56: "Gerimis Beku 🌧️",
    57: "Gerimis Beku Lebat 🌧️",
    61: "Hujan Ringan 🌧️",
    63: "Hujan Sedang 🌧️",
    65: "Hujan Lebat 🌧️",
    66: "Hujan Beku 🌧️",
    67: "Hujan Beku Lebat 🌧️",
    71: "Salju Ringan 🌨️",
    73: "Salju Sedang 🌨️",
    75: "Salju Lebat 🌨️",
    77: "Butiran Salju 🌨️",
    80: "Hujan Lokal Ringan 🌦️",
    81: "Hujan Lokal Sedang 🌦️",
    82: "Hujan Lokal Lebat ⛈️",
    85: "Salju Lokal Ringan 🌨️",
    86: "Salju Lokal Lebat 🌨️",
    95: "Badai Petir ⛈️",
    96: "Badai Petir + Hujan Es ⛈️",
    99: "Badai Petir Hebat ⛈️",
  };
  return map[code] || "Tidak diketahui 🤔";
}

function formatWeatherReport(data, session, location) {
  const c = data.current || {};
  const d = data.daily || {};
  const d0 = d.time ? (Array.isArray(d.time) ? d.time[0] : d.time) : "-";
  const tMax = Array.isArray(d.temperature_2m_max) ? d.temperature_2m_max[0] : d.temperature_2m_max;
  const tMin = Array.isArray(d.temperature_2m_min) ? d.temperature_2m_min[0] : d.temperature_2m_min;
  const wCode = Array.isArray(d.weather_code) ? d.weather_code[0] : d.weather_code;
  const precip = Array.isArray(d.precipitation_probability_max) ? d.precipitation_probability_max[0] : d.precipitation_probability_max;
  const uvIdx = Array.isArray(d.uv_index_max) ? d.uv_index_max[0] : d.uv_index_max;
  const sunrise = Array.isArray(d.sunrise) ? d.sunrise[0] : d.sunrise;
  const sunset = Array.isArray(d.sunset) ? d.sunset[0] : d.sunset;

  const greet = STATE.schedule[session]?.greeting || "";
  const temp = c.temperature_2m != null ? Math.round(c.temperature_2m) : "-";
  const feels = c.apparent_temperature != null ? Math.round(c.apparent_temperature) : "-";
  const humidity = c.relative_humidity_2m != null ? c.relative_humidity_2m + "%" : "-";
  const wind = c.wind_speed_10m != null ? Math.round(c.wind_speed_10m) + " km/h" : "-";
  const pressure = c.pressure_msl != null ? Math.round(c.pressure_msl) + " hPa" : "-";

  let text = greet + "!\n\n";
  text += "📍 *Cuaca: " + location + "*\n";
  text += "📆 " + new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) + "\n\n";

  text += "🌡️ Suhu Saat Ini: *" + temp + "°C*\n";
  text += "🤗 Terasa: *" + feels + "°C*\n";
  text += "☁️ Kondisi: *" + weatherCodeToString(c.weather_code ?? wCode) + "*\n";
  text += "💧 Kelembapan: *" + humidity + "*\n";
  text += "💨 Angin: *" + wind + "*\n";
  text += "📊 Tekanan: *" + pressure + "*\n\n";

  text += "─────────────────\n";
  text += "📈 Max Hari Ini: *" + (tMax != null ? Math.round(tMax) + "°C" : "-") + "*\n";
  text += "📉 Min Hari Ini: *" + (tMin != null ? Math.round(tMin) + "°C" : "-") + "*\n";
  text += "🌧️ Probabilitas Hujan: *" + (precip != null ? precip + "%" : "-") + "*\n";
  text += "☀️ UV Index: *" + (uvIdx != null ? uvIdx.toFixed(1) : "-") + "*\n";

  if (sunrise) {
    const sr = new Date(sunrise).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    text += "🌅 Sunrise: *" + sr + "*\n";
  }
  if (sunset) {
    const ss = new Date(sunset).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    text += "🌇 Sunset: *" + ss + "*\n";
  }

  text += "─────────────────\n";

  // Tips berdasarkan cuaca
  if (precip != null && precip >= 70) {
    text += "\n☔ *Tips:* Kemungkinan hujan tinggi! Bawa payung ya 🌂";
  } else if (uvIdx != null && uvIdx >= 7) {
    text += "\n🧴 *Tips:* UV tinggi! Pakai sunscreen & topi 🎩";
  } else if (temp != null && temp >= 33) {
    text += "\n🥤 *Tips:* Cuaca panas! Tetap terhidrasi minum air 💧";
  } else if (temp != null && temp <= 20) {
    text += "\n🧥 *Tips:* Cuaca sejuk, pakai jaket hangat!";
  } else {
    text += "\n✨ *Tips:* Cuaca cukup baik untuk aktivitas outdoor!";
  }

  text += "\n\n_" + (config.bot?.name || "Bot") + " • Auto Weather_";

  return text;
}

// ===================== SCHEDULER =====================

async function sendWeatherForSession(sock, session) {
  try {
    if (!STATE.enabled) return;
    if (!STATE.schedule[session] || !STATE.schedule[session].enabled) return;
    if (!STATE.targetChat) return;

    const data = await getWeatherData(STATE.lat, STATE.lon, STATE.timezone);
    const text = formatWeatherReport(data, session, STATE.location);

    await sock.sendMessage(STATE.targetChat, { text });
    STATE.lastSent[session] = Date.now();
  } catch (err) {
    // Silent fail — log only
    console.error("[AutoWeather] Failed session " + session + ": " + err.message);
  }
}

function setupTimers(sock) {
  // Clear existing timers
  for (const [session, timerId] of STATE.timers) {
    clearTimeout(timerId);
  }
  STATE.timers.clear();

  if (!STATE.enabled || !STATE.targetChat) return;

  for (const [session, cfg] of Object.entries(STATE.schedule)) {
    if (!cfg.enabled) continue;

    const scheduleNext = () => {
      const secs = secondsUntil(cfg.time);
      const timerId = setTimeout(async () => {
        await sendWeatherForSession(sock, session);
        scheduleNext(); // Schedule next day
      }, secs * 1000);
      STATE.timers.set(session, timerId);
    };

    scheduleNext();
  }
}

// ===================== MAIN HANDLER =====================

async function handler(m, { sock, db }) {
  const command = m.command;
  const args = (m.text || "").trim();
  const owner = isOwner(m);

  // ===================== ON / OFF =====================
  if (command === "aw") {
    if (!args) {
      // Show status
      let text = "🌤️ *Auto Weather System*\n\n";
      text += "◈ Status: *" + (STATE.enabled ? "ON ✅" : "OFF ⛔") + "*\n";
      text += "◈ Lokasi: *" + STATE.location + "*\n";
      text += "◈ Target: " + (STATE.targetChat || "Belum diset") + "\n\n";
      text += "⏰ *Jadwal Pengiriman:*\n";
      for (const [session, cfg] of Object.entries(STATE.schedule)) {
        text += "  " + (cfg.enabled ? "✅" : "⛔") + " " + session.charAt(0).toUpperCase() + session.slice(1) + " — " + cfg.time + " | " + cfg.greeting + "\n";
      }
      text += "\n📋 *Commands:*\n";
      text += ".aw on/off — Toggle\n";
      text += ".aw lokasi <kota> — Set lokasi\n";
      text += ".aw set <sesi> <jam> — Ubah jam\n";
      text += ".aw toggle <sesi> — On/off per sesi\n";
      text += ".aw test — Test kirim sekarang\n";
      text += ".aw target — Set chat tujuan (di grup/PM)";
      return m.reply(text);
    }

    const sub = args.toLowerCase().split(" ")[0];
    const rest = args.slice(sub.length).trim();

    if (sub === "on" || sub === "enable") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.enabled = true;
      if (!STATE.targetChat) STATE.targetChat = m.chat;
      setupTimers(sock);
      return m.reply("✅ *Auto Weather* diaktifkan!\n\nLokasi: *" + STATE.location + "*\nTarget: " + STATE.targetChat + "\n\nCuaca akan dikirim otomatis sesuai jadwal.");
    }

    if (sub === "off" || sub === "disable") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.enabled = false;
      for (const [session, timerId] of STATE.timers) clearTimeout(timerId);
      STATE.timers.clear();
      return m.reply("⛔ *Auto Weather* dinonaktifkan. Cuaca tidak akan dikirim otomatis.");
    }

    // ===================== SET LOCATION =====================
    if (sub === "lokasi" || sub === "location") {
      if (!owner) return m.reply("❌ Owner only");
      if (!rest) return m.reply("❌ Masukkan nama kota!\n\nContoh: .aw lokasi Bandung");
      try {
        await m.reply("🔍 Mencari lokasi: *" + rest + "*...");
        const coords = await getCoordinates(rest);
        STATE.location = coords.name + (coords.admin1 ? ", " + coords.admin1 : "") + (coords.country ? ", " + coords.country : "");
        STATE.lat = coords.lat;
        STATE.lon = coords.lon;
        if (STATE.enabled) setupTimers(sock);
        return m.reply("✅ Lokasi diatur ke: *" + STATE.location + "*\n📍 Koordinat: " + coords.lat.toFixed(4) + ", " + coords.lon.toFixed(4));
      } catch (err) {
        return m.reply("❌ " + err.message);
      }
    }

    // ===================== SET TIME =====================
    if (sub === "set") {
      if (!owner) return m.reply("❌ Owner only");
      const parts = rest.split(" ");
      const session = parts[0]?.toLowerCase();
      const time = parts[1];
      if (!session || !["pagi", "siang", "sore", "malam"].includes(session)) {
        return m.reply("❌ Sesi tidak valid! Pilih: pagi, siang, sore, malam\n\nContoh: .aw set pagi 07:00");
      }
      if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        return m.reply("❌ Format jam tidak valid! Gunakan HH:MM\n\nContoh: .aw set pagi 07:00");
      }
      const [h, mn] = time.split(":").map(Number);
      if (h > 23 || mn > 59) return m.reply("❌ Jam tidak valid!");

      STATE.schedule[session].time = time;
      if (STATE.enabled) setupTimers(sock);
      return m.reply("✅ Jadwal *" + session + "* diubah ke *" + time + "*");
    }

    // ===================== TOGGLE SESSION =====================
    if (sub === "toggle") {
      if (!owner) return m.reply("❌ Owner only");
      const session = rest.toLowerCase();
      if (!["pagi", "siang", "sore", "malam"].includes(session)) {
        return m.reply("❌ Sesi tidak valid! Pilih: pagi, siang, sore, malam");
      }
      STATE.schedule[session].enabled = !STATE.schedule[session].enabled;
      if (STATE.enabled) setupTimers(sock);
      return m.reply(
        (STATE.schedule[session].enabled ? "✅" : "⛔") + " Sesi *" + session + "* " +
        (STATE.schedule[session].enabled ? "diaktifkan" : "dinonaktifkan") + "\nJam: " + STATE.schedule[session].time
      );
    }

    // ===================== SET TARGET =====================
    if (sub === "target") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.targetChat = m.chat;
      if (STATE.enabled) setupTimers(sock);
      const isGroup = m.chat.endsWith("@g.us");
      return m.reply("✅ Target pengiriman diatur ke: *" + (isGroup ? "Grup ini" : "Chat ini") + "*\n\nID: " + m.chat);
    }

    // ===================== TEST =====================
    if (sub === "test" || sub === "now") {
      if (!owner) return m.reply("❌ Owner only");
      await m.reply("⏳ Mengambil data cuaca untuk *" + STATE.location + "*...");
      try {
        const data = await getWeatherData(STATE.lat, STATE.lon, STATE.timezone);
        // Detect session based on current hour
        const hour = new Date().getHours();
        let session = "pagi";
        if (hour >= 11 && hour < 14) session = "siang";
        else if (hour >= 14 && hour < 18) session = "sore";
        else if (hour >= 18 || hour < 5) session = "malam";
        const text = formatWeatherReport(data, session, STATE.location);
        return m.reply(text);
      } catch (err) {
        return m.reply("❌ Gagal mengambil cuaca: " + err.message);
      }
    }

    // ===================== RESET =====================
    if (sub === "reset") {
      if (!owner) return m.reply("❌ Owner only");
      STATE.schedule = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
      if (STATE.enabled) setupTimers(sock);
      return m.reply("✅ Jadwal direset ke default:\n• Pagi: 06:00\n• Siang: 12:00\n• Sore: 15:00\n• Malam: 19:00");
    }

    // ===================== JADWAL =====================
    if (sub === "jadwal" || sub === "schedule") {
      let text = "⏰ *Jadwal Auto Weather*\n\n";
      for (const [session, cfg] of Object.entries(STATE.schedule)) {
        text += (cfg.enabled ? "✅" : "⛔") + " *" + session.charAt(0).toUpperCase() + session.slice(1) + "* — " + cfg.time + "\n";
        text += "   " + cfg.greeting + "\n";
        if (STATE.lastSent[session]) {
          const last = new Date(STATE.lastSent[session]).toLocaleString("id-ID");
          text += "   Last sent: " + last + "\n";
        }
        text += "\n";
      }
      return m.reply(text.trim());
    }

    return m.reply("❌ Sub-command tidak dikenal. Ketik .aw untuk melihat bantuan.");
  }

  // ===================== AUTOWEATHER (alias) =====================
  if (command === "autoweather") {
    // Redirect to aw handler
    m.text = args;
    m.command = "aw";
    return handler(m, { sock, db });
  }

  return { handled: false };
}

// ===================== PLUGIN CONFIG =====================

const pluginConfig = {
  name: "autoweather",
  alias: ["aw", "autocuaca", "weatherauto"],
  category: "owner",
  description: "Auto kirim cuaca 4x sehari (pagi/siang/sore/malam) dari Open-Meteo API dengan toggle on/off",
  usage: ".aw | .aw on/off | .aw lokasi <kota> | .aw set <sesi> <jam> | .aw toggle <sesi> | .aw test",
  example: ".aw on\n.aw lokasi Bandung\n.aw set pagi 07:00",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

// ===================== EXPORT =====================

export function initAutoWeather(sock) {
  if (STATE.enabled && STATE.targetChat) {
    setupTimers(sock);
  }
}

export function getAutoWeatherState() {
  return {
    enabled: STATE.enabled,
    location: STATE.location,
    targetChat: STATE.targetChat,
    schedule: { ...STATE.schedule },
  };
}

export default { config: pluginConfig, handler };
