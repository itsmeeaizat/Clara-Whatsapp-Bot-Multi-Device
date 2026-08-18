/**
 * Info Gempa BMKG
 * ---------------------------------------------------------------
 * Data resmi dari BMKG (data.bmkg.go.id), gratis tanpa API key.
 *
 *   .gempa            gempa terkini (M ≥ 5.0)
 *   .gempa dirasakan  15 gempa terakhir yang dirasakan warga
 *   .gempa list       15 gempa terkini M ≥ 5.0
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const BASE = "https://data.bmkg.go.id/DataMKG/TEWS";
const TIMEOUT = 15000;

const pluginConfig = {
  name: "gempa",
  alias: ["bmkg", "infogempa", "earthquake", "gempabumi"],
  category: "info",
  description: "Info gempa terkini dari BMKG",
  usage: ".gempa [dirasakan|list]",
  example: ".gempa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function ambil(path) {
  const res = await fetch(`${BASE}/${path}`, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ClaraBot/1.0)" },
  });
  if (!res.ok) throw new Error(`BMKG error ${res.status}`);
  return res.json();
}

/** Ikon berdasar kekuatan gempa. */
function ikonMagnitudo(mag) {
  const m = parseFloat(mag) || 0;
  if (m >= 7) return "🔴";
  if (m >= 6) return "🟠";
  if (m >= 5) return "🟡";
  return "🟢";
}

/** Peringatan sesuai skala. */
function catatanMag(mag) {
  const m = parseFloat(mag) || 0;
  if (m >= 7) return "Gempa besar — waspada gempa susulan";
  if (m >= 6) return "Gempa kuat — periksa struktur bangunan";
  if (m >= 5) return "Gempa sedang — umumnya terasa jelas";
  return "Gempa ringan";
}

function blokGempa(g) {
  const ikon = ikonMagnitudo(g.Magnitude);
  return bracketBox(ikon, "ᴅᴇᴛᴀɪʟ", [
    `◦ Magnitudo: *M ${g.Magnitude}*`,
    `◦ Wilayah: *${g.Wilayah || "-"}*`,
    `◦ Kedalaman: *${g.Kedalaman || "-"}*`,
    `◦ Waktu: *${g.Tanggal || "-"} ${g.Jam || ""}*`,
    `◦ Koordinat: *${g.Lintang || "-"}, ${g.Bujur || "-"}*`,
    ...(g.Potensi ? [`◦ Potensi: *${g.Potensi}*`] : []),
    ...(g.Dirasakan && g.Dirasakan !== "-" ? [`◦ Dirasakan: *${g.Dirasakan}*`] : []),
  ]);
}

async function handler(m, { sock, config: botConfig }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const sub = ((m.text || "").trim().split(/\s+/)[0] || "").toLowerCase();

    /* --- daftar gempa dirasakan --- */
    if (["dirasakan", "terasa", "felt"].includes(sub)) {
      const data = await ambil("gempadirasakan.json");
      const list = data?.Infogempa?.gempa || [];
      if (!list.length) throw new Error("Data gempa dirasakan kosong");

      const lines = list.slice(0, 10).map((g, i) => {
        return `◦ ${i + 1}. ${ikonMagnitudo(g.Magnitude)} *M ${g.Magnitude}* — ${String(g.Wilayah || "-").slice(0, 38)}\n│     ${g.Tanggal} ${g.Jam}`;
      });

      await m.reply(
        alyaHeader("Gempa Dirasakan", "🌍") +
          "\n\n" +
          bracketBox("📋", "ᴛᴇʀᴀᴋʜɪʀ", lines) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Sumber: BMKG · data.bmkg.go.id"),
      );
      return { handled: true };
    }

    /* --- daftar gempa M>=5 --- */
    if (["list", "daftar", "terkini", "riwayat"].includes(sub)) {
      const data = await ambil("gempaterkini.json");
      const list = data?.Infogempa?.gempa || [];
      if (!list.length) throw new Error("Data gempa terkini kosong");

      const lines = list.slice(0, 10).map((g, i) => {
        return `◦ ${i + 1}. ${ikonMagnitudo(g.Magnitude)} *M ${g.Magnitude}* — ${String(g.Wilayah || "-").slice(0, 38)}\n│     ${g.Tanggal} ${g.Jam}`;
      });

      await m.reply(
        alyaHeader("Gempa Terkini", "🌍") +
          "\n\n" +
          bracketBox("📋", "ᴍ ≥ 5.0", lines) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}gempa untuk detail gempa terbaru`),
      );
      return { handled: true };
    }

    /* --- gempa terbaru + shakemap --- */
    const data = await ambil("autogempa.json");
    const g = data?.Infogempa?.gempa;
    if (!g) throw new Error("Data gempa tidak tersedia");

    const teks =
      alyaHeader("Gempa Terkini", "🌍") +
      "\n\n" +
      blokGempa(g) +
      "\n\n" +
      bracketBox("ℹ️", "ᴄᴀᴛᴀᴛᴀɴ", [`◦ ${catatanMag(g.Magnitude)}`]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`${prefix}gempa dirasakan · ${prefix}gempa list`);

    // Coba kirim peta guncangan; kalau gagal, teks saja sudah cukup
    if (g.Shakemap) {
      try {
        await sock.sendMessage(
          m.chat,
          { image: { url: `${BASE}/${g.Shakemap}` }, caption: teks },
          { quoted: m },
        );
        return { handled: true };
      } catch {
        // lanjut ke teks biasa
      }
    }

    await m.reply(teks);
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          `◦ Alasan: *${String(error.message).slice(0, 120)}*`,
          "◦ Server BMKG mungkin sedang sibuk.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Coba lagi beberapa saat"),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { ikonMagnitudo, catatanMag };
