import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

// Cache city list
let cityCache = null;

async function getCityId(cityName) {
  if (!cityCache) {
    const res = await axios.get("https://api.myquran.com/v2/sholat/kota/semua", { timeout: 10000 });
    cityCache = res.data?.data || [];
  }
  const found = cityCache.find(c =>
    c.lokasi?.toLowerCase().includes(cityName.toLowerCase())
  );
  return found?.id || null;
}

const pluginConfig = {
  name: "jadwalsholat",
  alias: ["jadwalsholat", "jadwalsalat", "sholat", "salat", "prayer"],
  category: "religi",
  description: "Cek jadwal sholat berdasarkan kota",
  usage: ".jadwalsholat <nama kota>",
  example: ".jadwalsholat jakarta",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const city = m.text?.trim();

    if (!city) {
      const text =
        alyaHeader("Cara Pakai", "🕌") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}jadwalsholat <kota>*`,
          `◦ Contoh: *${prefix}jadwalsholat jakarta*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const cityId = await getCityId(city);
    if (!cityId) {
      // Try direct numeric ID
      const directRes = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${cityId || city}/2026/08/16`, { timeout: 10000 }).catch(() => null);
      if (!directRes?.data?.status) throw new Error(`Kota "${city}" tidak ditemukan`);
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const res = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`, { timeout: 10000 });
    const jadwal = res.data?.data?.jadwal;

    if (!jadwal) throw new Error("Jadwal sholat tidak ditemukan");

    const text =
      alyaHeader("Jadwal Sholat", "🕌") +
      "\n\n" +
      bracketBox("🕌", "ᴊᴀᴅᴡᴀʟ ꜱʜᴏʟᴀᴛ", [
        `◦ Kota: *${res.data.data.lokasi}*`,
        `◦ Tanggal: *${jadwal.tanggal}*`,
      ]) +
      "\n\n" +
      `◦ Imsak: *${jadwal.imsak}*` +
      "\n" +
      `◦ Subuh: *${jadwal.subuh}*` +
      "\n" +
      `◦ Terbit: *${jadwal.terbit}*` +
      "\n" +
      `◦ Dhuha: *${jadwal.dhuha}*` +
      "\n" +
      `◦ Dzuhur: *${jadwal.dzuhur}*` +
      "\n" +
      `◦ Ashar: *${jadwal.ashar}*` +
      "\n" +
      `◦ Maghrib: *${jadwal.maghrib}*` +
      "\n" +
      `◦ Isya: *${jadwal.isya}*` +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}jadwalsholat <kota> untuk kota lain`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        `◦ Status: *Gagal*`,
        `◦ Alasan: *${error.message}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
