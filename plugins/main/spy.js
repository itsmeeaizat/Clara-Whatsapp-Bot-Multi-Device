// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "spy",
  alias: ["spy", "intel", "cektarget", "spyuser"],
  category: "info",
  description: "Lihat info target",
  usage: ".spy <@target>",
  example: ".spy @username",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = m.text?.trim() || "";
    const target = raw.replace(/^\.spy\s+/i, "").trim();

    if (!target) {
      const text =
        alyaHeader("Cara Pakai", "🕵️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}spy <@target>*`,
          `◦ Contoh: *${prefix}spy @username*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const targetId = target.replace(/^@+/, "");
    const userKey = Object.keys(db.data || {}).find((key) => String(key).includes(targetId));

    const userName = targetId;
    const userData = userKey ? db.get(userKey) : null;
    const rpg = userData?.rpg || null;

    const lines = [
      `◦ Target: *${userName}*`,
      rpg ? `◦ Level: *${rpg.level || 0}*` : "◦ Level: *-*",
      rpg ? `◦ Gold: *${rpg.gold ?? 0}*` : "◦ Gold: *-*",
      rpg ? `◦ Exp: *${rpg.exp || 0}*` : "◦ Exp: *-*",
      "◦ Status: *Berhasil*",
    ];

    const text =
      alyaHeader("Spy", "🕵️") +
      "\n\n" +
      bracketBox("🕵️", "ɪɴᴛᴇʟ", lines) +
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
