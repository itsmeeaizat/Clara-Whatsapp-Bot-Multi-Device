/**
 * Menu Utama — Tampilan Clara Klasik
 * ---------------------------------------------------------------
 * Tampilan disamakan dengan Clara-MD orisinal (Zeltoria) yang sudah
 * berhenti dikembangkan, karena repo ini adalah penerusnya.
 *
 * Struktur asli yang ditiru:
 *   ╔┈┈「 *Info User* 」  →  ╠┈┈「 *Info Hari* 」  →  ╠┈┈「 *Info Bot* 」
 *   lalu readmore, lalu blok per kategori ╔┈「 Kategori 」 dengan ╎ぎ .cmd
 *
 * Tombol interaktif tetap dipertahankan sebagai pelengkap (Clara lama
 * "No Button"), tapi isi teksnya kini bergaya klasik. Bila pengiriman
 * interaktif gagal, otomatis jatuh ke teks polos yang sudah lengkap.
 */

import { prepareWAMessageMedia } from "ourin";
import config from "../../config.js";
import { getTimeGreeting } from "../../src/lib/clara-formatter.js";
import {
  blok,
  blokKategori,
  baris,
  barisKosong,
  clockString,
  getWeton,
  tanggalIslam,
  namaHari,
  tanggalLengkap,
  jamWib,
  READ_MORE,
} from "../../src/lib/clara-classic-style.js";
import { getRole } from "../../src/lib/clara-level.js";
import {
  getCommandsByCategory,
  getSortedCategories,
  getPluginCount,
  CATEGORY_EMOJIS,
} from "../../src/lib/clara-plugins.js";
import fs from "fs";
import os from "os";

const pluginConfig = {
  name: "menu",
  alias: ["help", "bantuan", "commands", "m", "?"],
  category: "main",
  description: "Menampilkan menu utama bot",
  usage: ".menu",
  example: ".menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

/** Label kategori rapi, meniru tabel `tags` di Clara lama. */
const LABEL_KATEGORI = {
  main: "Main",
  ai: "AI",
  anime: "Animanga",
  internet: "Internet",
  download: "Download",
  downloader: "Download",
  sticker: "Sticker",
  tools: "Tools",
  religi: "Islamic",
  islamic: "Islamic",
  group: "Group",
  game: "Game",
  rpg: "RPG",
  economy: "Economy",
  quotes: "Quotes",
  maker: "Maker",
  owner: "Owner",
  info: "Info",
  fun: "Fun",
  search: "Search",
  music: "Music",
  media: "Media",
};

function labelKategori(cat) {
  return LABEL_KATEGORI[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

function formatRAM() {
  const used = process.memoryUsage().rss;
  const total = os.totalmem();
  return `${(used / 1024 / 1024).toFixed(0)}MB / ${(total / 1024 / 1024 / 1024).toFixed(1)}GB`;
}

/* ------------------------------------------------------------------ */
/* Blok header ala Clara lama                                          */
/* ------------------------------------------------------------------ */

function buildHeaderKlasik(m, botConfig, uptime, db) {
  const prefix = botConfig.command?.prefix || ".";
  const d = new Date();
  const nomor = String(m.sender || "").split("@")[0];

  // Menu tidak boleh gagal total hanya karena database bermasalah.
  let user = {};
  try {
    user = (db?.getUser ? db.getUser(m.sender) : null) || {};
  } catch {
    user = {};
  }
  const level = user.level ?? 1;
  const exp = user.exp ?? 0;
  const koin = user.koin ?? 0;
  const energi = user.energi === -1 ? "∞" : (user.energi ?? 0);
  const prems = user.isPremium ? "Premium" : "Free";
  const role = m.isOwner ? "👑 Owner" : getRole(level);

  // Progres exp menuju level berikutnya (Clara lama: %exp / %maxexp)
  const EXP_PER_LEVEL = 10000;
  const expSekarang = exp % EXP_PER_LEVEL;

  let totalUser = 0;
  try {
    totalUser = Object.keys(db?.getAllUsers?.() || {}).length;
  } catch {
    totalUser = 0;
  }

  const mode = (botConfig.mode || "public").toLowerCase() === "self" ? "Private" : "Publik";

  return blok([
    {
      judul: "Info User",
      baris: [
        baris("Nama", m.pushName || "Tanpa Nama"),
        baris("Nomor", `@${nomor}`),
        baris("Premium", prems),
        // Clara lama memakai istilah "Limit" dan "Money"; di basis ini
        // field-nya bernama energi & koin, jadi labelnya disamakan.
        baris("Limit", energi),
        baris("Money", koin),
        baris("Role", role),
        baris("Level", level),
        baris("Xp", `${expSekarang} / ${EXP_PER_LEVEL}`),
        baris("Total Xp", exp),
      ],
    },
    {
      judul: "Info Hari",
      baris: [
        baris("Waktu", jamWib(d)),
        baris("Hari", `${namaHari(d)} ${getWeton(d)}`),
        baris("Tanggal", tanggalLengkap(d)),
        baris("Tanggal Islam", tanggalIslam(d)),
      ],
    },
    {
      judul: "Info Bot",
      baris: [
        baris("Bot Name", botConfig.bot?.name || "Clara"),
        baris("Mode", mode),
        baris("Platform", os.platform()),
        baris("Type", "Node.Js"),
        baris("Baileys", "Multi Device"),
        baris("Prefix", `[ *${prefix}* ]`),
        baris("Uptime", clockString((uptime || 0) * 1000)),
        baris("RAM", formatRAM()),
        baris("Total Command", getPluginCount()),
        baris("Database", `${totalUser} pengguna`),
      ],
    },
  ]);
}

/* ------------------------------------------------------------------ */
/* Daftar kategori ala Clara lama                                      */
/* ------------------------------------------------------------------ */

function buildDaftarKategori(m, prefix, hanyaKategori = null) {
  const commandsByCategory = getCommandsByCategory();
  const sorted = getSortedCategories(m);
  const out = [];

  for (const { name: cat } of sorted) {
    if (cat === "owner" && !m.isOwner) continue;
    if (hanyaKategori && cat !== hanyaKategori) continue;

    const cmds = commandsByCategory[cat] || [];
    if (!cmds.length) continue;

    out.push(blokKategori(labelKategori(cat), cmds, prefix));
  }

  return out.join("\n");
}

/**
 * Teks menu lengkap bergaya klasik: header + readmore + semua kategori.
 * Dipakai juga sebagai fallback bila pesan interaktif gagal dikirim.
 */
function buildMenuLengkap(m, botConfig, uptime, db, { pakaiReadMore = true } = {}) {
  const prefix = botConfig.command?.prefix || ".";
  const header = buildHeaderKlasik(m, botConfig, uptime, db);
  const kategori = buildDaftarKategori(m, prefix);
  const sambungan = pakaiReadMore ? READ_MORE : "\n";
  return `${header}\n${sambungan}\n${kategori}`;
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

async function handler(m, { sock, config: botConfig, db, uptime }) {
  try {
    await m.react("🕐");
  } catch {
    // reaksi opsional
  }

  const prefix = botConfig.command?.prefix || ".";
  const greeting = getTimeGreeting();
  const namaBot = botConfig.bot?.name || "Clara";

  const sortedCategories = getSortedCategories(m);
  if (!sortedCategories.length) {
    await m.reply("Belum ada menu yang tersedia saat ini.");
    try {
      await m.react("✅");
    } catch {}
    return { handled: true };
  }

  const teksLengkap = buildMenuLengkap(m, botConfig, uptime, db);
  const mentions = [m.sender];

  // --- Coba kirim versi interaktif (header + tombol kategori) ---
  try {
    let media = null;
    try {
      const gambar = botConfig.assets?.["clara"];
      if (gambar && fs.existsSync(gambar)) {
        media = await prepareWAMessageMedia(
          { image: fs.readFileSync(gambar) },
          { upload: sock.waUploadToServer },
        );
      }
    } catch {
      media = null;
    }

    const categoryRows = sortedCategories
      .filter(({ name }) => name !== "owner" || m.isOwner)
      .slice(0, 10)
      .map(({ name: cat, commands }) => ({
        title: `${CATEGORY_EMOJIS[cat] || "📁"} ${labelKategori(cat)}`,
        description: `${commands.length} command`,
        id: `${prefix}menucat ${cat}`,
      }));

    const sections = [
      { title: `${namaBot} | DAFTAR KATEGORI`, rows: categoryRows },
    ];

    const quoted = {
      key: { participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
      message: {
        contactMessage: {
          displayName: `🪸 ${namaBot}`,
          vcard:
            `BEGIN:VCARD\nVERSION:3.0\nN:;${namaBot};;;\nFN:${namaBot}\n` +
            `item1.TEL;waid=0:0\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          sendEphemeral: true,
        },
      },
    };

    await sock.relayMessage(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: { mentionedJid: mentions },
            interactiveMessage: {
              header: {
                title: "",
                subtitle: "",
                hasMediaAttachment: !!media,
                ...(media ? { imageMessage: media.imageMessage } : {}),
              },
              body: { text: teksLengkap },
              footer: { text: `${greeting} • ${namaBot} Multidevice` },
              contextInfo: {
                isForwarded: true,
                forwardingScore: 9,
                mentionedJid: mentions,
                forwardedNewsletterMessageInfo: {
                  newsletterJid:
                    botConfig.saluran?.id || "120363400911374213@newsletter",
                  newsletterName: botConfig.saluran?.name || namaBot,
                  serverMessageId: 127,
                },
              },
              nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                  bottom_sheet: {
                    in_thread_buttons_limit: 2,
                    divider_indices: [],
                    list_title: "📂 Pilih kategori menu",
                    button_title: "📂 Lihat Kategori",
                  },
                }),
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "📂 Menu Kategori",
                      sections,
                      icon: "DEFAULT",
                    }),
                  },
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "📌 Semua Menu",
                      id: `${prefix}allmenu`,
                    }),
                  },
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "👑 Owner",
                      id: `${prefix}owner`,
                    }),
                  },
                ],
              },
            },
          },
        },
      },
      { quoted },
    );
  } catch {
    // Fallback: teks polos, isinya sudah lengkap (header + semua kategori)
    await m.reply(teksLengkap, { mentions });
  }

  try {
    await m.react("✅");
  } catch {}

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
export { buildHeaderKlasik, buildDaftarKategori, buildMenuLengkap, labelKategori };
