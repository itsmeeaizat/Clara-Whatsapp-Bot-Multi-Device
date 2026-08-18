/**
 * Info Gempa (BMKG)
 * ---------------------------------------------------------------
 * Recode dari internet-gempa.js (Zeltoria/Clara-MD).
 * Menampilkan info gempa terkini dari BMKG.
 */

import axios from "axios";

const BMKG_BASE = "https://data.bmkg.go.id/DataMKG/TEWS/";

const pluginConfig = {
  name: "gempa",
  alias: ["gempa", "infogempa"],
  category: "main",
  description: "Info gempa terkini dari BMKG",
  usage: ".gempa",
  example: ".gempa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const res = await axios.get(`${BMKG_BASE}autogempa.json`, { timeout: 15000 });
    const gempa = res.data?.Infogempa?.gempa;

    if (!gempa) {
      await m.reply("❌ Data gempa tidak tersedia saat ini.");
      return { handled: true };
    }

    let txt = `*${gempa.Wilayah}*\n\n`;
    txt += `📅 Tanggal : ${gempa.Tanggal}\n`;
    txt += `⏰ Waktu : ${gempa.Jam}\n`;
    txt += `⚡ Potensi : *${gempa.Potensi}*\n\n`;
    txt += `📊 Magnitude : ${gempa.Magnitude}\n`;
    txt += `🔻 Kedalaman : ${gempa.Kedalaman}\n`;
    txt += `📍 Koordinat : ${gempa.Coordinates}`;

    if (gempa.Dirasakan && gempa.Dirasakan.length > 3) {
      txt += `\n🚨 Dirasakan : ${gempa.Dirasakan}`;
    }

    // Kirim dengan shakemap image
    const shakemapUrl = `${BMKG_BASE}${gempa.Shakemap}`;
    await sock.sendMessage(
      m.chat,
      {
        image: { url: shakemapUrl },
        caption: txt,
      },
      { quoted: m }
    );
  } catch (err) {
    console.error("[gempa] Error:", err.message);
    await m.reply("❌ Gagal mengambil data gempa. Coba lagi nanti.");
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
