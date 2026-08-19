// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "cm",
  alias: ["cm", "customcmd", "addcmd", "delcmd"],
  category: "tools",
  description: "Kelola custom command bot",
  usage: ".cm add/del/list <nama> <balasan>",
  example: ".cm add halo Halo juga!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = m.text?.trim().split(/\s+/);
    const action = args?.[0]?.toLowerCase();
    const name = args?.[1];
    const value = args?.slice(2).join(" ");

    const db = getDatabase();
    const customCmds = db.getSettings().customCmds || {};

    if (action === "add") {
      if (!name || !value) {
        const text =
          alyaHeader("Custom Command", "⚙️") +
          "\n\n" +
          bracketBox("📋", "ɪɴꜰᴏ", [
            `◦ Penggunaan: *${prefix}cm add <nama> <balasan>*`,
            `◦ Contoh: *${prefix}cm add halo Halo juga!*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      customCmds[name] = value;
      db.setting("customCmds", customCmds);

      const text =
        alyaHeader("Custom Command", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ꜱᴛᴀᴛᴜꜱ", [
          `◦ Aksi: *ADD*`,
          `◦ Nama: *${name}*`,
          `◦ Balasan: *${value}*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}cm list untuk melihat semua cmd`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "del") {
      if (!name) {
        const text =
          alyaHeader("Custom Command", "⚙️") +
          "\n\n" +
          bracketBox("📋", "ɪɴꜰᴏ", [
            `◦ Penggunaan: *${prefix}cm del <nama>*`,
            `◦ Contoh: *${prefix}cm del halo*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Ketik ${prefix}menu untuk kembali`);

        await m.reply(text);
        return { handled: true };
      }

      delete customCmds[name];
      db.setting("customCmds", customCmds);

      const text =
        alyaHeader("Custom Command", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ꜱᴛᴀᴛᴜꜱ", [
          `◦ Aksi: *DEL*`,
          `◦ Nama: *${name}*`,
          "◦ Status: *SUCCESS*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}cm list untuk melihat sisa cmd`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    if (action === "list") {
      const keys = Object.keys(customCmds);
      const items = keys.length
        ? keys.map((k) => `◦ ${k}: *${customCmds[k]}*`).join("\n")
        : "◦ *Tidak ada custom command*";

      const text =
        alyaHeader("Custom Command", "⚙️") +
        "\n\n" +
        bracketBox("⚙️", "ʟɪsᴛ", [items]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}cm add <nama> <balasan> untuk menambah`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const text =
      alyaHeader("Custom Command", "⚙️") +
      "\n\n" +
      bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}cm add/del/list <nama> <balasan>*`,
        `◦ Contoh: *${prefix}cm add halo Halo juga!*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

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
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
