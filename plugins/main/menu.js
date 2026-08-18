/**
 * Menu Utama — dua mode tampilan
 * ---------------------------------------------------------------
 * Bot ini punya dua gaya menu yang bisa dipilih lewat .modemenu:
 *
 *   klasik (default) — meniru Clara-MD orisinal (Zeltoria) yang sudah
 *                      berhenti dikembangkan; repo ini penerusnya
 *                      dipercantik dengan emoji section, greeting, footer
 *   modern           — gaya khas repo ini: ✧ header, ╭─ box, small caps
 *
 * Enhanced: ditambah audio PTT & externalAdReply seperti aslinya.
 */

import { prepareWAMessageMedia } from "ourin";
import { getTimeGreeting } from "../../src/lib/clara-formatter.js";
import { getMode } from "../../src/lib/clara-menu-mode.js";
import { buildMenu, labelKategori } from "../../src/lib/clara-menu-builder.js";
import {
  getSortedCategories,
  CATEGORY_EMOJIS,
} from "../../src/lib/clara-plugins.js";
import fs from "fs";

// Thumbnail default (sama dengan Clara-MD aslinya)
const DEFAULT_THUMBNAIL = "https://telegra.ph/file/c5170017e92f837e28d5f.jpg";

// Audio PTT untuk menu (dari Clara-MD aslinya)
const MENU_AUDIO = [
  "https://bucin-livid.vercel.app/audio/yowaimo.mp3",
  "https://bucin-livid.vercel.app/audio/summer.mp3",
  "https://bucin-livid.vercel.app/audio/one.m4a",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

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

async function handler(m, { sock, config: botConfig, db, uptime }) {
  try {
    await m.react("🕐");
  } catch {
    // reaksi opsional
  }

  const prefix = botConfig.command?.prefix || ".";
  const greeting = getTimeGreeting();
  const namaBot = botConfig.bot?.name || "Clara";
  const mode = getMode(db, botConfig);

  const sortedCategories = getSortedCategories(m);
  if (!sortedCategories.length) {
    await m.reply("Belum ada menu yang tersedia saat ini.");
    try {
      await m.react("✅");
    } catch {}
    return { handled: true };
  }

  const teksLengkap = buildMenu(mode, m, botConfig, uptime, db);
  const mentions = [m.sender];

  // Thumbnail untuk externalAdReply
  const thumbnailUrl =
    botConfig.assets?.thumbnailUrl || DEFAULT_THUMBNAIL;

  // --- Coba kirim versi interaktif ---
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

    // Quoted message: contact message seperti Clara-MD aslinya
    const quoted = {
      key: {
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
      },
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
                externalAdReply: {
                  title: namaBot,
                  body: botConfig.bot?.author || "Clara Bot",
                  thumbnailUrl: thumbnailUrl,
                  sourceUrl: botConfig.bot?.website || "https://wa.me",
                  mediaType: 1,
                  renderLargerThumbnail: true,
                },
                ...(botConfig.saluran?.id ? {
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: botConfig.saluran?.id,
                    newsletterName: botConfig.saluran?.name || namaBot,
                    serverMessageId: 127,
                  },
                } : {}),
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
                      display_text: "🎨 Ganti Gaya",
                      id: `${prefix}modemenu`,
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

    // --- Kirim audio PTT (seperti Clara-MD aslinya) ---
    try {
      const audioUrl = pickRandom(MENU_AUDIO);
      await sock.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mp4",
          ptt: true,
        },
        { quoted: m }
      );
    } catch {
      // Audio opsional, gagal tidak masalah
    }
  } catch {
    // Fallback: teks polos dengan externalAdReply
    try {
      await sock.sendMessage(
        m.chat,
        {
          text: teksLengkap,
          contextInfo: {
            mentionedJid: mentions,
            externalAdReply: {
              title: namaBot,
              body: botConfig.bot?.author || "Clara Bot",
              thumbnailUrl: thumbnailUrl,
              sourceUrl: botConfig.bot?.website || "https://wa.me",
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m }
      );
    } catch {
      // Last resort: plain reply
      await m.reply(teksLengkap, { mentions });
    }
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
