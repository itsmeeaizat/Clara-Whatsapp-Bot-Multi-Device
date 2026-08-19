// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Category Menu — daftar semua kategori beserta commandnya
 * ---------------------------------------------------------------
 * Menggantikan menu2.js yang redundan.
 * Menampilkan seluruh kategori beserta daftar command di tiap kategori,
 * dengan gaya klasik enhanced (╔┈「 」 + emoji per kategori).
 */

import {
  getSortedCategories,
  getPluginCount,
  CATEGORY_EMOJIS,
} from "../../src/lib/clara-plugins.js";
import { labelKategori } from "../../src/lib/clara-menu-builder.js";
import { getMode } from "../../src/lib/clara-menu-mode.js";
import {
  blokKategori,
  headerBanner,
  footerBanner,
} from "../../src/lib/clara-classic-style.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "menucategory",
  alias: ["allmenucategory", "allmenucat"],
  category: "main",
  description: "Menampilkan semua kategori beserta commandnya",
  usage: ".menucategory",
  example: ".menucategory",
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
    const prefix = botConfig.command?.prefix || ".";
    const namaBot = botConfig.bot?.name || "Clara";
    const mode = getMode(db, botConfig);
    const sortedCategories = getSortedCategories(m);

    if (!sortedCategories.length) {
      await m.reply("Belum ada kategori yang tersedia.");
      return { handled: true };
    }

    const totalCmd = getPluginCount();
    const totalCat = sortedCategories.length;

    if (mode === "modern") {
      // --- Gaya modern ---
      let txt = alyaHeader("Daftar Kategori", "📂") + "\n\n";
      txt += bracketBox("📊", "sᴛᴀᴛɪsᴛɪᴋ", [
        `✿ Total Kategori  ·  *${totalCat}*`,
        `✿ Total Command  ·  *${totalCmd}*`,
      ]) + "\n\n";

      for (const { name: cat, emoji, commands } of sortedCategories) {
        const label = labelKategori(cat);
        const icon = emoji || CATEGORY_EMOJIS[cat] || "📁";
        const cmdList = commands.map((c) => `${prefix}${c}`).join(" | ");
        txt += `${icon} *${label}*\n   ✿ ${cmdList}\n\n`;
      }

      txt += separator() + "\n";
      txt += tipText(`Ketik ${prefix}menucat <kategori> untuk detail`) + "\n";
      txt += tipText(`Ketik ${prefix}menu untuk menu utama`);

      await m.reply(txt, { mentions: [m.sender] });
    } else {
      // --- Gaya klasik enhanced ---
      const nomor = String(m.sender || "").split("@")[0];
      const banner = headerBanner(namaBot, nomor);

      // Info ringkas
      const infoBlok = [
        `╔┈┈「 📊 *Ringkasan* 」`,
        `╎`,
        `╎❏ *Total Kategori:* ${totalCat}`,
        `╎❏ *Total Command:* ${totalCmd}`,
        `╎❏ *Prefix:* [ *${prefix}* ]`,
        `╚┈┈┈┈┈┈┈┈┈❖`,
      ].join("\n");

      // Daftar kategori + command
      const kategoriBlocks = sortedCategories.map(({ name: cat, commands }) => {
        const label = labelKategori(cat);
        return blokKategori(label, commands, prefix);
      }).join("\n\n");

      const footer = footerBanner(namaBot, prefix);

      const teks = `${banner}${infoBlok}\n\n${kategoriBlocks}\n${footer}`;
      await m.reply(teks, { mentions: [m.sender] });
    }
  } catch (err) {
    await m.reply(`❌ Gagal menampilkan kategori: ${String(err.message).slice(0, 100)}`);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
