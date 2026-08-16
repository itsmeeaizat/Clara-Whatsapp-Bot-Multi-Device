import {
  prepareWAMessageMedia,
} from "ourin";
import config from "../../config.js";
import {
  formatUptime,
  getTimeGreeting,
} from "../../src/lib/clara-formatter.js";
import {
  alyaHeader,
  bracketBox,
  infoBlock,
  userInfoBlock,
  alyaCategoryRow,
  separator,
  tipText,
  toSmallCaps,
  toMonoUpperBold,
} from "../../src/lib/clara-menu-style.js";
import {
  getCommandsByCategory,
  getCategories,
  getSortedCategories,
  getPluginCount,
  CATEGORY_EMOJIS,
} from "../../src/lib/clara-plugins.js";
import { getDatabase } from "../../src/lib/clara-database.js";
import fs from "fs";
import os from "os";

const pluginConfig = {
  name: "menu",
  alias: ["help", "bantuan", "commands", "m"],
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

async function buildCategoryMenuText(selectedCategory, m, botConfig, prefix) {
  const commandsByCategory = getCommandsByCategory();
  const categories = getCategories();

  const categoryLabel = selectedCategory ? toMonoUpperBold(selectedCategory) : "ALL";
  const emoji = CATEGORY_EMOJIS[selectedCategory || ""] || "📁";

  let txt = alyaHeader(selectedCategory ? `Menu ${selectedCategory}` : "Menu All", emoji);
  txt += "\n\n";

  const targetCategories = selectedCategory ? [selectedCategory] : categories;

  for (const cat of targetCategories) {
    if (cat === "owner" && !m.isOwner) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const catEmoji = CATEGORY_EMOJIS[cat] || "📁";
    txt += alyaCategoryRow(catEmoji, cat, cmds.map((cmd) => `${prefix}${cmd}`).join(" | "));
    txt += "\n\n";
  }

  txt += separator() + "\n";
  txt += tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);
  txt += "\n";
  txt += tipText(`Ketik ${prefix}daftar untuk melihat daftar kategori`);

  return txt;
}

function formatRAM() {
  const used = process.memoryUsage().rss;
  const total = os.totalmem();
  const usedMB = (used / 1024 / 1024).toFixed(0);
  const totalGB = (total / 1024 / 1024 / 1024).toFixed(1);
  return `${usedMB}MB / ${totalGB}GB`;
}

function buildHomeText(m, botConfig, uptime, greeting, db) {
  const prefix = botConfig.command?.prefix || ".";
  const timeStr = new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
  const dateStr = new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const uptimeFormatted = formatUptime(uptime);
  const totalCommand = getPluginCount();

  const role = m.isOwner ? "owner" : "user";

  let txt = alyaHeader("Menu Utama", "🤖") + "\n\n";
  txt += userInfoBlock(m.pushName, m.sender, "active", role);
  txt += "\n\n";

  const userData = db?.getUser ? db.getUser(m.sender) : null;
  if (userData && !m.isOwner) {
    txt += infoBlock([
      ["Level", userData.level ?? 1],
      ["Exp", userData.exp ?? 0],
      ["Koin", userData.koin ?? 0],
      ["Energi", userData.energi === -1 ? "∞" : (userData.energi ?? 0)],
      ["Status", userData.isPremium ? "💎 Premium" : "Reguler"],
    ], "sᴛᴀᴛɪsᴛɪᴋ ᴋᴀᴍᴜ", "🌸");
    txt += "\n\n";
  }

  txt += infoBlock([
    ["Bot", botConfig.bot?.name || "Clara-AI"],
    ["Versi", botConfig.bot?.version || "1.0"],
    ["Mode", (botConfig.mode || "public").toUpperCase()],
    ["Total Command", totalCommand],
    ["Uptime", uptimeFormatted],
    ["RAM", formatRAM()],
    ["Platform", `${os.type()} · Node ${process.version}`],
    ["Prefix", `[ ${prefix} ]`],
    ["Tanggal", dateStr],
    ["Waktu", timeStr],
  ], "sᴇʀᴠᴇʀ", "📊");
  txt += "\n\n";
  txt += separator() + "\n";
  txt += tipText(`Ketik ${prefix}allmenu untuk semua command`);
  txt += "\n";
  txt += tipText(`Ketik ${prefix}daftar untuk lihat kategori`);
  return txt;
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
  await m.react('🕐');
  const menuVariant = botConfig.ui?.menuVariant || 2;
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const prefix = botConfig.command?.prefix || ".";
  const greeting = getTimeGreeting();

  const imageBuffer = fs.readFileSync(botConfig.assets["clara"]);

  const sortedCategories = getSortedCategories(m);
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();

  if (sortedCategories.length === 0) {
    await m.reply("Belum ada menu yang tersedia saat ini.");
    await m.react('✅');
    return;
  }

  const categoryRows = [];
  for (const { name: cat, commands: cmds, emoji } of sortedCategories) {
    const target = `${prefix}menucat ${cat}`;
    categoryRows.push({
      title: `${emoji} ${toMonoUpperBold(cat)}`,
      description: `Menampilkan menu ${cat} (${cmds.length} command)`,
      id: target,
    });
  }

  const bodyText = buildHomeText(m, botConfig, uptime, greeting, db);
  const rowTexts = [];
  for (const { name: cat, commands: cmds, emoji } of sortedCategories) {
    const label = `${emoji} ${toMonoUpperBold(cat)}`;
    rowTexts.push(label + "\n  ◦ " + cmds.map(cmd => `${prefix}${cmd}`).join("\n  ◦ "));
  }

  const sections = [
    {
      title: `${botConfig.bot?.name || "Clara-AI"} | DAFTAR KATEGORI`,
      rows: categoryRows.slice(0, 10),
    },
  ];

  const quoted = {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
    },
    message: {
      contactMessage: {
        displayName: '🪸 ' + (botConfig.bot?.name || 'Clara-AI'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:XL;' + (botConfig.bot?.name || 'Clara') + ';;;\nFN:' + (botConfig.bot?.name || 'Clara-AI') + '\nitem1.TEL;waid=' + ((botConfig.owner?.number?.[0] || '0').replace(/[^0-9]/g, '')) + ':' + (botConfig.owner?.number?.[0] || '0') + '\nitem1.X-ABLabel:Ponsel\nEND:VCARD',
        sendEphemeral: true,
      },
    },
  };

  try {
    const media = await prepareWAMessageMedia({
      image: imageBuffer,
    }, { upload: sock.waUploadToServer });

    await sock.sendMessage(m.chat, {
      text: bodyText,
      footer: `${greeting} • Pilih kategori menu dibawah ini`,
    });

    await sock.relayMessage(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            mentionedJid: [m.sender],
          },
          interactiveMessage: {
            header: {
              title: "",
              subtitle: "",
              hasMediaAttachment: true,
              imageMessage: media.imageMessage,
            },
            body: {
              text: `📂 *Pilih kategori menu*\n\n${separator()}\n💡 *Ketik ${prefix}menu untuk kembali ke menu utama*`,
            },
            footer: {
              text: `${greeting} • Pilih kategori menu dibawah ini`,
            },
            contextInfo: {
              isForwarded: true,
              forwardingScore: 9,
              forwardedNewsletterMessageInfo: {
                newsletterJid: botConfig.saluran?.id || "120363400911374213@newsletter",
                newsletterName: botConfig.saluran?.name || botConfig.bot?.name || "Clara-AI",
                serverMessageId: 127,
              },
              mentionedJid: [m.sender],
            },
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify({
                bottom_sheet: {
                  in_thread_buttons_limit: 2,
                  divider_indices: [],
                  list_title: "📂 Pilih kategori menu",
                  button_title: "📂 Lihat Kategori",
                },
                limited_time_offer: {
                  text: greeting,
                  expiration_time: Date.now() + 1000000,
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
                    display_text: "📋 Menu",
                    id: `${prefix}menu`,
                  }),
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "💡 Tanya AI",
                    id: `${prefix}aihelp`,
                  }),
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📌 Semua Menu",
                    id: `${prefix}allmenu`,
                  }),
                },
              ],
            },
          },
        },
      },
    }, { quoted });
  } catch (e) {
    await m.reply(bodyText);
  }

  await m.react('✅');
}

export default {
  config: pluginConfig,
  handler,
};
