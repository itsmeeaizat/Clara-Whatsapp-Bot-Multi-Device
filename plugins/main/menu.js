/**
 * Menu Utama — dua mode tampilan
 * ---------------------------------------------------------------
 * Bot ini punya dua gaya menu yang bisa dipilih lewat .modemenu:
 *
 *   klasik (default) — meniru Clara-MD orisinal (Zeltoria) yang sudah
 *                      berhenti dikembangkan; repo ini penerusnya
 *   modern           — gaya khas repo ini: ✧ header, ╭─ box, small caps
 *
 * Penyusunan teksnya ada di src/lib/clara-menu-builder.js supaya
 * .menu dan .allmenu bisa memakai keduanya tanpa menyalin kode.
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
  } catch {
    // Fallback: teks polos, isinya sudah lengkap
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
