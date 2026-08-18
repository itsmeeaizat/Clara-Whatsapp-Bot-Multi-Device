/**
 * All Menu — daftar SELURUH command
 * ---------------------------------------------------------------
 * Mengikuti mode tampilan aktif (.modemenu): klasik atau modern.
 *
 * Dua bug versi sebelumnya yang diperbaiki di sini:
 *
 *  1. `cat.commands.slice(0, 10)` memotong daftar di 10 command per
 *     kategori. Untuk kategori AI (51 command) berarti 41 command tidak
 *     pernah tampil — padahal nama perintahnya "allmenu".
 *
 *  2. Blok penanganan tombol "allkategori" berada DI LUAR try/catch
 *     tempat `prefix` dideklarasikan, sehingga memicu
 *     "ReferenceError: prefix is not defined" bila blok itu dijalankan.
 *     Blok tersebut juga redundan karena isinya sama dengan menu utama.
 */

import { getMode, labelMode } from "../../src/lib/clara-menu-mode.js";
import { buildMenu } from "../../src/lib/clara-menu-builder.js";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPluginCount } from "../../src/lib/clara-plugins.js";

const pluginConfig = {
  name: "allmenu",
  alias: ["allcmd", "semuamenu", "fullmenu", "listmenu"],
  category: "main",
  description: "Tampilkan semua command bot",
  usage: ".allmenu",
  example: ".allmenu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const mode = getMode(db, botConfig);

    // Tanpa slice — semua command ditampilkan, sesuai namanya.
    const teks = buildMenu(mode, m, botConfig, uptime, db);

    const catatan =
      mode === "klasik"
        ? `\n\n╔┈┈「 *Info* 」\n╎❏ *Total:* ${getPluginCount()} command\n╎❏ *Gaya:* ${labelMode(mode)}\n╎❏ Ganti gaya: *${prefix}modemenu*\n╚┈┈┈┈┈┈┈┈┈❖`
        : "\n\n" +
          bracketBox("📌", "ɪɴꜰᴏ", [
            `◦ Total: *${getPluginCount()} command*`,
            `◦ Gaya: *${labelMode(mode)}*`,
            `◦ Ganti gaya: *${prefix}modemenu*`,
          ]);

    await m.reply(teks + catatan, { mentions: [m.sender] });
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          "◦ Status: *Error*",
          `◦ Alasan: *${String(error.message).slice(0, 150)}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`),
    );
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
