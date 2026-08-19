// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Phone Charger Search & Info
 * Cari charger HP, daya pengisian (Watt), tipe port, dan rekomendasi.
 * Usage: .chargi <merk / tipe HP / nama charger>
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "chargi",
  alias: ["chargersearch", "charger", "caricharger"],
  category: "tools",
  description: "Cari informasi dan rekomendasi charger HP",
  usage: ".chargi <merk / tipe hp / charger>",
  example: ".chargi charger samsung 45w",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

// Database rekomendasi charger populer & spesifikasi
const CHARGER_DATABASE = [
  {
    keywords: ["anker", "nano", "gan"],
    name: "Anker Nano II 65W GaN Fast Charger",
    brand: "Anker",
    power: "65 Watt",
    ports: "USB-C (Power Delivery 3.0 / PPS)",
    compat: "iPhone, Samsung Galaxy, MacBook, Laptop USB-C, iPad",
    price: "Rp 350.000 - Rp 450.000",
    features: "Teknologi GaN II, Ukuran Ringkas, Proteksi Suhu & Overcharge",
  },
  {
    keywords: ["ugreen", "nexode"],
    name: "Ugreen Nexode 65W GaN 3-Port Charger",
    brand: "Ugreen",
    power: "65 Watt Max",
    ports: "2x USB-C + 1x USB-A",
    compat: "Semua HP Android, iPhone, Laptop, Tablet",
    price: "Rp 300.000 - Rp 400.000",
    features: "Multi-Port GaN Fast Charge, Power Delivery 3.0, Quick Charge 4.0+",
  },
  {
    keywords: ["samsung", "45w", "25w"],
    name: "Samsung Super Fast Charging 45W Power Adapter",
    brand: "Samsung",
    power: "45 Watt (PPS 11V/4.05A)",
    ports: "USB-C to USB-C",
    compat: "Samsung S24 Ultra, S23 Ultra, Note 20, Tab S9, Z Fold",
    price: "Rp 250.000 - Rp 350.000",
    features: "Official Power Delivery 3.0 dengan PPS untuk Samsung Fast Charge 2.0",
  },
  {
    keywords: ["baseus", "gan5"],
    name: "Baseus GaN5 Pro Quick Charger 65W",
    brand: "Baseus",
    power: "65 Watt",
    ports: "2x USB-C + 1x USB-A",
    compat: "iPhone 15/14, Xiaomi, Poco, Huawei, Laptop",
    price: "Rp 280.000 - Rp 380.000",
    features: "BPS II Smart Power Split, Desain Elegan, Termasuk Kabel C-to-C 100W",
  },
  {
    keywords: ["apple", "iphone", "20w"],
    name: "Apple 20W USB-C Power Adapter",
    brand: "Apple",
    power: "20 Watt",
    ports: "USB-C",
    compat: "iPhone 12/13/14/15/16, iPad, AirPods Pro",
    price: "Rp 299.000 - Rp 399.000",
    features: "Pengisian Cepat Official Apple (0-50% dalam 30 menit)",
  },
  {
    keywords: ["xiaomi", "120w", "67w"],
    name: "Xiaomi HyperCharge 120W Wall Charger",
    brand: "Xiaomi",
    power: "120 Watt Super Fast",
    ports: "USB-A to USB-C (Custom Pin)",
    compat: "Xiaomi 13T Pro, Poco F5/F6 Pro, Redmi Note Series",
    price: "Rp 250.000 - Rp 350.000",
    features: "Protokol Xiaomi HyperCharge (0-100% dalam ~19 menit)",
  },
];

async function handler(m) {
  const query = m.args?.join(" ");
  if (!query) {
    return m.reply(
      alyaHeader("Charger Search", "🔌") +
        "\n\n" +
        bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
          `◦ Ketik: *${m.prefix || "."}chargi <merk / hp / charger>*`,
          `◦ Contoh: *${m.prefix || "."}chargi anker 65w*`,
          `◦ Contoh: *${m.prefix || "."}chargi charger samsung*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Cari charger HP dengan proteksi & kecepatan terbaik!"),
    );
  }

  try {
    const qLower = query.toLowerCase();

    // 1. Search in database
    const matched = CHARGER_DATABASE.filter((item) =>
      item.keywords.some((kw) => qLower.includes(kw)) ||
      item.name.toLowerCase().includes(qLower) ||
      item.brand.toLowerCase().includes(qLower),
    );

    let txt = alyaHeader("Pencarian Charger", "🔌") + `\n\n🔎 *Query:* _${query}_\n\n`;

    if (matched.length > 0) {
      matched.forEach((c) => {
        txt += bracketBox("⚡", c.name, [
          `◦ Merk: *${c.brand}*`,
          `◦ Daya Max: *${c.power}*`,
          `◦ Port: *${c.ports}*`,
          `◦ Kompatibilitas: *${c.compat}*`,
          `◦ Kisaran Harga: *${c.price}*`,
          `◦ Fitur: *${c.features}*`,
        ]) + "\n\n";
      });
    } else {
      // 2. Fetch web search results for custom query
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent("charger " + query)}&hl=id`;
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error("Gagal mengambil data charger");

      txt += bracketBox("ℹ️", "Rekomendasi Charger General", [
        `◦ Tipe: *Charger Pengisian Cepat (Fast Charging)*`,
        `◦ Rekomendasi Merk: *Anker, Ugreen, Baseus, Official Brand*`,
        `◦ Protokol Wajib: *USB Power Delivery (PD 3.0) / PPS / QC 4.0*`,
        `◦ Cari di e-Commerce: https://www.tokopedia.com/search?q=${encodeURIComponent("charger " + query)}`,
      ]) + "\n\n";
    }

    txt += separator() + "\n" + tipText("Selalu gunakan charger berkualitas untuk menjaga kesehatan baterai HP!");
    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 150)}`);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
