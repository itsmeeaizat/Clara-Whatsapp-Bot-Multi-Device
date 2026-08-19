// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Weather — popcat.xyz
 * Usage: .weather Jakarta  |  .cuaca Jakarta
 */

import { popcatJSON } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "weather",
  alias: ["cuaca"],
  category: "tools",
  description: "Cek cuaca kota tertentu",
  usage: ".weather <nama kota>",
  example: ".weather Jakarta",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const q = m.args?.join(" ") || "";
  if (!q) {
    return m.reply(`Nama kotanya mana?\nContoh: ${m.prefix || "."}weather Jakarta`);
  }

  try {
    const data = await popcatJSON("weather", { q });
    if (!Array.isArray(data) || !data[0]) {
      return m.reply("❌ Kota tidak ditemukan.");
    }

    const loc = data[0].location;
    const cur = data[0].current;
    const forecast = data[0].forecast || [];

    let txt = `🌤️ Cuaca: ${loc.name}\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `🌡️ Suhu: ${cur.temperature}°C\n`;
    txt += `🤔 Terasa: ${cur.feelslike}°C\n`;
    txt += `☁️ Kondisi: ${cur.skytext}\n`;
    txt += `💧 Kelembapan: ${cur.humidity}%\n`;
    txt += `💨 Angin: ${cur.winddisplay}\n`;
    txt += `📅 ${cur.day}, ${cur.date}\n`;
    txt += `⏰ Obs: ${cur.observationtime}\n`;

    if (forecast.length > 0) {
      txt += `\n━━━ Prakiraan ━━━\n`;
      for (let i = 0; i < Math.min(3, forecast.length); i++) {
        const f = forecast[i];
        txt += `${f.shortday} ${f.date}: ${f.skytextday} | ${f.low}°–${f.high}°C | 🌧️ ${f.precip}%\n`;
      }
    }

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
