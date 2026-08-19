/**
 * Mode Menu
 * ---------------------------------------------------------------
 * Ganti gaya tampilan menu bot antara:
 *
 *   klasik — meniru Clara-MD orisinal (Clara Aizat): ╔┈┈「 」 ╎❏ ╎ぎ
 *   modern — gaya khas repo ini: ✧ header, ╭─ box, small caps
 *
 * Pengaturan berlaku global (per-bot) dan tersimpan di database,
 * jadi tetap bertahan setelah bot restart.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  getMode,
  setMode,
  resolveMode,
  labelMode,
} from "../../src/lib/clara-menu-mode.js";

const pluginConfig = {
  name: "modemenu",
  alias: ["menumode", "gayamenu", "modemenus", "stylemenu", "temamenu"],
  category: "owner",
  description: "Ganti gaya tampilan menu: klasik atau modern",
  usage: ".modemenu <klasik|modern>",
  example: ".modemenu klasik",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

/** Contoh singkat tiap gaya supaya owner tahu bedanya sebelum memilih. */
function contohKlasik() {
  return [
    "╔┈┈「 *Info User* 」",
    "╎❏ *Nama:* Aizat",
    "╠┈┈「 *Info Bot* 」",
    "╎❏ *Prefix:* [ *.* ]",
    "╚┈┈┈┈┈┈┈┈┈❖",
    "",
    "╔┈「 Main 」",
    "╎ぎ .menu",
    "╚┈┈┈┈┈┈┈┈┈❖",
  ].join("\n");
}

function contohModern() {
  return [
    "✧　🤖 *ᴍᴇɴᴜ ᴜᴛᴀᴍᴀ* 　✧",
    "┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄",
    "",
    "╭─ 📊 *ꜱᴇʀᴠᴇʀ*",
    "│  ✿ Bot  ·  *Clara*",
    "│  ✿ Prefix  ·  *[ . ]*",
    "╰─ · · ·",
  ].join("\n");
}

function statusText(prefix, aktif) {
  return (
    alyaHeader("Mode Menu", "🎨") +
    "\n\n" +
    bracketBox("🎨", "ɢᴀʏᴀ ᴀᴋᴛɪꜰ", [`◦ *${labelMode(aktif)}*`]) +
    "\n\n" +
    bracketBox("1️⃣", "ᴋʟᴀꜱɪᴋ", [
      "◦ Meniru Clara-MD orisinal (Clara Aizat)",
      "◦ Kotak ╔┈┈「 」 dengan ╎❏ dan ╎ぎ",
      `◦ Pilih: *${prefix}modemenu klasik*`,
    ]) +
    "\n\n" +
    bracketBox("2️⃣", "ᴍᴏᴅᴇʀɴ", [
      "◦ Gaya khas bot ini",
      "◦ Header ✧ dengan kotak ╭─ dan small caps",
      `◦ Pilih: *${prefix}modemenu modern*`,
    ]) +
    "\n\n" +
    bracketBox("👁️", "ʟɪʜᴀᴛ ᴄᴏɴᴛᴏʜ", [
      `◦ *${prefix}modemenu contoh klasik*`,
      `◦ *${prefix}modemenu contoh modern*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Berlaku untuk .menu dan .allmenu")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const aktif = getMode(db, botConfig);

    /* --- lihat contoh --- */
    if (["contoh", "preview", "lihat", "demo"].includes(sub)) {
      const target = resolveMode(args[1]) || aktif;
      const contoh = target === "modern" ? contohModern() : contohKlasik();
      await m.reply(
        alyaHeader(`Contoh Gaya ${labelMode(target)}`, "👁️") +
          "\n\n" +
          contoh +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Pilih dengan ${prefix}modemenu ${target}`),
      );
      return { handled: true };
    }

    /* --- tanpa argumen: status --- */
    if (!sub || ["status", "cek"].includes(sub)) {
      await m.reply(statusText(prefix, aktif));
      return { handled: true };
    }

    /* --- ganti mode --- */
    const target = resolveMode(sub);
    if (!target) {
      await m.reply(
        alyaHeader("Gaya Tidak Dikenal", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ᴘɪʟɪʜᴀɴ", [
            "◦ *klasik* — gaya Clara orisinal",
            "◦ *modern* — gaya bot ini",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Contoh: ${prefix}modemenu klasik`),
      );
      return { handled: true };
    }

    if (target === aktif) {
      await m.reply(
        alyaHeader("Sudah Aktif", "ℹ️") +
          "\n\n" +
          bracketBox("ℹ️", "ɪɴꜰᴏ", [`◦ Gaya *${labelMode(target)}* memang sedang dipakai.`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}menu untuk melihatnya`),
      );
      return { handled: true };
    }

    const ok = setMode(db, target);
    if (!ok) {
      await m.reply(
        alyaHeader("Gagal Menyimpan", "❌") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Database sedang bermasalah."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Coba lagi beberapa saat"),
      );
      return { handled: true };
    }

    await m.reply(
      alyaHeader("Gaya Diubah", "🎨") +
        "\n\n" +
        bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
          `◦ Dari: *${labelMode(aktif)}*`,
          `◦ Ke: *${labelMode(target)}*`,
          "◦ Berlaku untuk .menu dan .allmenu",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk melihat hasilnya`),
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}modemenu untuk bantuan`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
