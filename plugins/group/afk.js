// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * AFK (Away From Keyboard)
 * ---------------------------------------------------------------
 * User menandai diri sedang pergi. Bila ada yang mention atau reply
 * ke user tersebut, bot memberi tahu alasan dan sudah berapa lama.
 * Begitu user itu chat lagi, status AFK otomatis dilepas.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { num, humanDuration } from "../../src/lib/clara-group-util.js";

const KEY = "afkUsers";

/* ------------------------------------------------------------------ */
/* State (global, lintas grup)                                         */
/* ------------------------------------------------------------------ */

function getAll(db) {
  try {
    const raw = db?.setting?.(KEY);
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function setAfk(db, jid, data) {
  try {
    const all = { ...getAll(db) };
    if (data === null) delete all[num(jid)];
    else all[num(jid)] = data;
    db?.setting?.(KEY, all);
    return true;
  } catch {
    return false;
  }
}

function getAfk(db, jid) {
  return getAll(db)[num(jid)] || null;
}

/* ------------------------------------------------------------------ */
/* Listener                                                            */
/* ------------------------------------------------------------------ */

/**
 * Dipanggil untuk setiap pesan grup.
 * 1. Bila pengirim sedang AFK -> lepas status, beri tahu.
 * 2. Bila pengirim mention/reply user yang AFK -> beri tahu.
 *
 * @returns {Promise<null|{type:string,text:string,mentions:string[]}>}
 */
async function checkAfk(m, db) {
  try {
    if (!m?.isGroup) return null;

    const all = getAll(db);
    if (!Object.keys(all).length) return null;

    const sender = num(m.sender);

    /* --- 1. pengirim kembali dari AFK --- */
    if (all[sender]) {
      const data = all[sender];
      const lama = humanDuration(Date.now() - (data.since || Date.now()));
      setAfk(db, sender, null);
      return {
        type: "kembali",
        text:
          alyaHeader("Selamat Datang Kembali", "👋") +
          "\n\n" +
          bracketBox("👋", "ᴀꜰᴋ ꜱᴇʟᴇꜱᴀɪ", [
            `◦ @${sender} sudah kembali`,
            `◦ Pergi selama: *${lama}*`,
            data.alasan ? `◦ Alasan tadi: *${data.alasan}*` : "◦ Tanpa alasan",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Status AFK otomatis dilepas"),
        mentions: [`${sender}@s.whatsapp.net`],
      };
    }

    /* --- 2. menyebut orang yang sedang AFK --- */
    const targets = new Set();
    for (const j of m.mentionedJid || []) targets.add(num(j));
    if (m.quoted?.sender) targets.add(num(m.quoted.sender));
    targets.delete(sender);

    const kena = [...targets].filter((t) => all[t]);
    if (!kena.length) return null;

    const lines = kena.slice(0, 5).map((t) => {
      const d = all[t];
      const lama = humanDuration(Date.now() - (d.since || Date.now()));
      return `◦ @${t} sedang AFK (${lama})\n│     ${d.alasan || "tanpa alasan"}`;
    });

    return {
      type: "mention",
      text:
        alyaHeader("Sedang AFK", "💤") +
        "\n\n" +
        bracketBox("💤", "ᴛɪᴅᴀᴋ ᴀᴋᴛɪꜰ", lines) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Mereka akan balas setelah kembali"),
      mentions: kena.slice(0, 5).map((t) => `${t}@s.whatsapp.net`),
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "afk",
  alias: ["afk", "away", "pergi", "sibuk"],
  category: "group",
  description: "Tandai diri sedang pergi, bot balas otomatis bila di-mention",
  usage: ".afk <alasan>",
  example: ".afk lagi makan",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const alasan = (m.text || "").trim().slice(0, 100);
    const sender = num(m.sender);
    const sudah = getAfk(db, sender);

    /* --- cek daftar AFK --- */
    if (["list", "daftar", "siapa"].includes(alasan.toLowerCase())) {
      const all = getAll(db);
      const entries = Object.entries(all);
      const lines = entries.length
        ? entries.slice(0, 15).map(([j, d]) => {
            const lama = humanDuration(Date.now() - (d.since || Date.now()));
            return `◦ @${j} — ${d.alasan || "tanpa alasan"} (${lama})`;
          })
        : ["◦ Tidak ada yang sedang AFK."];

      await m.reply(
        alyaHeader("Daftar AFK", "💤") +
          "\n\n" +
          bracketBox("💤", "ꜱᴇᴅᴀɴɢ ᴘᴇʀɢɪ", lines) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Total: ${entries.length} orang`),
        { mentions: entries.slice(0, 15).map(([j]) => `${j}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- sudah AFK -> lepas --- */
    if (sudah) {
      const lama = humanDuration(Date.now() - (sudah.since || Date.now()));
      setAfk(db, sender, null);
      await m.reply(
        alyaHeader("AFK Dilepas", "👋") +
          "\n\n" +
          bracketBox("👋", "ɪɴꜰᴏ", [
            `◦ Kamu AFK selama: *${lama}*`,
            "◦ Status sudah dilepas.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}afk <alasan> untuk AFK lagi`)
      );
      return { handled: true };
    }

    /* --- set AFK --- */
    setAfk(db, sender, {
      alasan: alasan || "",
      since: Date.now(),
      nama: m.pushName || sender,
    });

    await m.reply(
      alyaHeader("Mode AFK Aktif", "💤") +
        "\n\n" +
        bracketBox("💤", "ɪɴꜰᴏ", [
          `◦ @${sender} sekarang AFK`,
          alasan ? `◦ Alasan: *${alasan}*` : "◦ Tanpa alasan",
          "◦ Bot akan balas otomatis bila kamu disebut.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Kirim pesan apa pun untuk melepas AFK"),
      { mentions: [`${sender}@s.whatsapp.net`] }
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}afk untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { checkAfk, getAfk, setAfk, getAll, KEY };
