// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Jadwal TV - TV Schedule
 * Fetch dari https://api.jol.network/jadwal-tv atau fallback static schedule.
 * Usage: .jadwaltv [channel]
 */

const staticSchedules = {
  rcti: [
    { time: "04:30", event: "Seputar iNews Pagi" },
    { time: "06:00", event: "Go Spot" },
    { time: "08:30", event: "Dahsyatnya 2026" },
    { time: "12:00", event: "Izin Nyanyi" },
    { time: "15:00", event: "Tukang Ojek Preman" },
    { time: "17:30", event: "Terbelenggu Rindu" },
    { time: "19:15", event: "Cinta Yasmin" },
    { time: "21:30", event: "Cinta Berakhir Bahagia" }
  ],
  sctv: [
    { time: "04:30", event: "Liputan 6 Pagi" },
    { time: "06:00", event: "Hot Shot" },
    { time: "08:30", event: "FTV Pagi" },
    { time: "12:00", event: "Liputan 6 Siang" },
    { time: "14:15", event: "FTV Sore" },
    { time: "17:00", event: "My Heart" },
    { time: "18:15", event: "Saleha" },
    { time: "20:00", event: "Naik Ranjang" },
    { time: "21:45", event: "Luka Cinta" }
  ],
  transtv: [
    { time: "05:00", event: "Islam Itu Indah" },
    { time: "06:30", event: "Insert Pagi" },
    { time: "08:30", event: "Pagi-Pagi Ambyar" },
    { time: "10:00", event: "Siapa Mau Jadi Juara" },
    { time: "11:30", event: "Insert Siang" },
    { time: "12:30", event: "Brownis (Obrowlan Manis)" },
    { time: "14:00", event: "Rumpi (No Secret)" },
    { time: "16:00", event: "Bikin Laper" },
    { time: "18:30", event: "Dunia Punya Cerita" },
    { time: "21:00", event: "Bioskop Trans TV 1" },
    { time: "23:00", event: "Bioskop Trans TV 2" }
  ],
  trans7: [
    { time: "05:15", event: "Hikmah" },
    { time: "06:00", event: "Redaksi Pagi" },
    { time: "08:00", event: "Selebrita Pagi" },
    { time: "09:00", event: "FYP (For Your Pagi)" },
    { time: "10:15", event: "Trending" },
    { time: "12:00", event: "Redaksi Siang" },
    { time: "13:00", event: "Bocah Petualang" },
    { time: "14:00", event: "Si Otan" },
    { time: "17:15", event: "Makan Receh" },
    { time: "19:00", event: "POV (Pasti Obrolan Viral)" },
    { time: "20:15", event: "Arisan" },
    { time: "21:30", event: "Lapor Pak!" }
  ],
  indosiar: [
    { time: "04:30", event: "Fokus Pagi" },
    { time: "06:00", event: "Magic 5" },
    { time: "08:30", event: "Kisah Nyata Pagi" },
    { time: "11:30", event: "Fokus Siang" },
    { time: "12:00", event: "Kisah Nyata Siang" },
    { time: "15:00", event: "Kisah Nyata Spesial" },
    { time: "18:00", event: "Magic 5 Season 3" },
    { time: "20:00", event: "BRI Liga 1 / Mega Film Asia" }
  ],
  net: [
    { time: "05:00", event: "Top Spot" },
    { time: "06:30", event: "Inikah Cinta" },
    { time: "08:30", event: "Makan Enak" },
    { time: "10:30", event: "Main Hakim Sendiri" },
    { time: "12:30", event: "Kuliner Viral" },
    { time: "15:00", event: "Drakor Sore" },
    { time: "18:00", event: "Biarkan Cinta Menari" },
    { time: "20:00", event: "Main Hakim Sendiri Malam" }
  ],
  gtv: [
    { time: "05:00", event: "Buletin iNews Pagi" },
    { time: "06:30", event: "SpongeBob SquarePants" },
    { time: "10:00", event: "Super Deal Indonesia" },
    { time: "12:30", event: "SpongeBob SquarePants" },
    { time: "16:00", event: "Super Deal Indonesia Sore" },
    { time: "18:30", event: "Kuya Keren" },
    { time: "20:30", event: "Big Movies Platinum" }
  ],
  tvone: [
    { time: "04:30", event: "Kabar Pagi" },
    { time: "06:30", event: "Apa Kabar Indonesia Pagi" },
    { time: "08:30", event: "Rumah Mamah Dedeh" },
    { time: "11:00", event: "Kabar Siang" },
    { time: "13:00", event: "Hidup Sehat" },
    { time: "16:00", event: "Kabar Petang" },
    { time: "19:00", event: "Apa Kabar Indonesia Malam" },
    { time: "21:00", event: "Kabar Utama" }
  ],
  metrotv: [
    { time: "04:30", event: "Metro Pagi Primetime" },
    { time: "06:30", event: "Selamat Pagi Indonesia" },
    { time: "08:30", event: "Go Healthy" },
    { time: "11:05", event: "Metro Siang" },
    { time: "13:00", event: "Newsline" },
    { time: "15:30", event: "Metro Hari Ini" },
    { time: "17:30", event: "Prime Time News" },
    { time: "19:30", event: "Top News" }
  ]
};

const pluginConfig = {
  name: "jadwaltv",
  alias: ["jadwaltv", "tv"],
  category: "tools",
  description: "Jadwal acara TV Indonesia",
  usage: ".jadwaltv [channel]",
  example: ".jadwaltv rcti",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const query = m.args?.[0]?.toLowerCase()?.trim();

  try {
    let apiData = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://api.jol.network/jadwal-tv", {
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        apiData = await res.json();
      }
    } catch {
      // API unreachable, fallback to static schedule
    }

    if (apiData && apiData.result) {
      let resultText = `*📺 JADWAL ACARA TV*\n\n`;
      if (Array.isArray(apiData.result)) {
        for (const item of apiData.result) {
          resultText += `*${item.channel || item.stasiun}*\n`;
          if (Array.isArray(item.schedule || item.jadwal)) {
            for (const s of (item.schedule || item.jadwal)) {
              resultText += `• ${s.time || s.jam} - ${s.event || s.acara}\n`;
            }
          }
          resultText += `\n`;
        }
      } else {
        resultText += JSON.stringify(apiData.result, null, 2);
      }
      return m.reply(resultText.trim());
    }

    // Static schedule fallback
    if (query && staticSchedules[query]) {
      const channelName = query.toUpperCase();
      let text = `*📺 JADWAL ACARA TV - ${channelName}*\n\n`;
      for (const item of staticSchedules[query]) {
        text += `• *${item.time}* - ${item.event}\n`;
      }
      return m.reply(text.trim());
    }

    // Show all available channels or schedule overview
    let text = `*📺 JADWAL ACARA TV INDONESIA*\n\n`;
    const channels = Object.keys(staticSchedules);

    if (query) {
      text += `⚠️ Channel *"${query}"* tidak ditemukan.\nChannel tersedia: ${channels.map(c => c.toUpperCase()).join(", ")}\n\n`;
    }

    for (const [ch, items] of Object.entries(staticSchedules)) {
      text += `*━ ${ch.toUpperCase()} ━*\n`;
      for (const item of items.slice(0, 5)) {
        text += `  • *${item.time}* ${item.event}\n`;
      }
      if (items.length > 5) text += `  _...dan ${items.length - 5} acara lainnya_\n`;
      text += `\n`;
    }

    text += `💡 *Tips:* Ketik *${m.prefix || "."}jadwaltv <channel>* untuk jadwal lengkap (Contoh: *${m.prefix || "."}jadwaltv rcti*)`;

    return m.reply(text.trim());
  } catch (err) {
    return m.reply(`❌ Gagal mengambil jadwal TV: ${String(err.message).slice(0, 100)}`);
  }
}

export default { config: pluginConfig, handler };
