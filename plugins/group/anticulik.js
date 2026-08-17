/**
 * Anti-Culik
 * ---------------------------------------------------------------
 * Melindungi bot dari "diculik" — yaitu ditarik masuk ke grup asing
 * oleh orang yang tidak berhak.
 *
 * Hook sudah terpasang di src/connection.js (event group-participants.update
 * action "add"), memanggil handleAntiCulik(event, sock, db). Sebelumnya file
 * ini tidak ada sehingga fitur diam-diam tidak aktif.
 *
 * Mode:
 *   off      - nonaktif
 *   owner    - hanya owner yang boleh menambahkan bot (default)
 *   whitelist- owner + nomor pada daftar putih
 *
 * Bila penambah tidak berhak: bot kirim pesan sopan lalu keluar.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import config from "../../config.js";

const SETTING_KEY = "antiCulik";
const LEAVE_DELAY_MS = 2500;

/* ------------------------------------------------------------------ */
/* State helpers                                                       */
/* ------------------------------------------------------------------ */

function defaultState() {
  return { enabled: true, mode: "owner", whitelist: [], log: [] };
}

function getState(db) {
  try {
    const raw = db?.setting?.(SETTING_KEY);
    if (!raw || typeof raw !== "object") return defaultState();
    return {
      enabled: raw.enabled ?? true,
      mode: ["off", "owner", "whitelist"].includes(raw.mode) ? raw.mode : "owner",
      whitelist: Array.isArray(raw.whitelist) ? raw.whitelist : [],
      log: Array.isArray(raw.log) ? raw.log : [],
    };
  } catch {
    return defaultState();
  }
}

function saveState(db, state) {
  try {
    db?.setting?.(SETTING_KEY, {
      enabled: !!state.enabled,
      mode: state.mode,
      whitelist: state.whitelist.slice(0, 200),
      log: state.log.slice(-30),
    });
    return true;
  } catch {
    return false;
  }
}

/** Ambil digit nomor dari JID/LID apa pun. */
function toNumber(jid) {
  return String(jid || "").split("@")[0].split(":")[0].replace(/\D/g, "");
}

function ownerNumbers() {
  const raw = config?.owner?.number;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.map(toNumber).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Event handler — dipanggil dari connection.js                        */
/* ------------------------------------------------------------------ */

/**
 * @returns {Promise<boolean>} true bila bot keluar (connection.js akan berhenti memproses)
 */
async function handleAntiCulik(event, sock, db) {
  try {
    const state = getState(db);
    if (!state.enabled || state.mode === "off") return false;

    const groupId = event?.id;
    if (!groupId) return false;

    // Siapa yang menambahkan bot
    const inviter = event?.author || "";
    const inviterNum = toNumber(inviter);

    // Tanpa info penambah, jangan ambil tindakan (hindari false positive)
    if (!inviterNum) return false;

    const owners = ownerNumbers();
    if (owners.includes(inviterNum)) return false;

    if (state.mode === "whitelist") {
      const allowed = state.whitelist.map(toNumber);
      if (allowed.includes(inviterNum)) return false;
    }

    // Tidak berhak -> catat, pamit, keluar
    let groupName = groupId;
    try {
      const meta = await sock.groupMetadata(groupId);
      groupName = meta?.subject || groupId;
    } catch {
      // biarkan pakai id
    }

    state.log.push({
      group: groupName,
      groupId,
      by: inviterNum,
      at: new Date().toISOString(),
    });
    saveState(db, state);

    const ownerContact = owners[0] || config?.bot?.support || "owner";
    const text =
      alyaHeader("Anti Culik", "🛡️") +
      "\n\n" +
      bracketBox("🛡️", "ᴘʀᴏᴛᴇᴋꜱɪ", [
        "◦ Bot hanya boleh ditambahkan oleh owner.",
        `◦ Ditambahkan oleh: @${inviterNum}`,
        "◦ Bot akan keluar dari grup ini.",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ingin pakai bot? Hubungi wa.me/${ownerContact}`);

    try {
      await sock.sendMessage(groupId, {
        text,
        mentions: [`${inviterNum}@s.whatsapp.net`],
      });
    } catch {
      // tetap keluar walau gagal kirim pesan
    }

    await new Promise((r) => setTimeout(r, LEAVE_DELAY_MS));
    await sock.groupLeave(groupId);

    // Laporkan ke owner
    try {
      if (owners[0]) {
        await sock.sendMessage(`${owners[0]}@s.whatsapp.net`, {
          text:
            `🛡️ *Anti-Culik aktif*\n\n` +
            `Bot ditarik ke grup *${groupName}* oleh @${inviterNum} ` +
            `dan sudah otomatis keluar.`,
          mentions: [`${inviterNum}@s.whatsapp.net`],
        });
      }
    } catch {
      // notifikasi owner opsional
    }

    return true;
  } catch {
    // Jangan sampai error di sini mengganggu alur connection.js
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin command                                                      */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "anticulik",
  alias: ["anticulik", "anti-culik", "antikidnap", "culikprotect"],
  category: "owner",
  description: "Cegah bot ditarik ke grup asing oleh orang tak berhak",
  usage: ".anticulik <on/off/mode/add/del/list/log>",
  example: ".anticulik on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function statusText(prefix, state) {
  const modeLabel = {
    off: "nonaktif",
    owner: "hanya owner",
    whitelist: "owner + whitelist",
  }[state.mode];

  return (
    alyaHeader("Anti Culik", "🛡️") +
    "\n\n" +
    bracketBox("🛡️", "ꜱᴛᴀᴛᴜꜱ", [
      `◦ Aktif: *${state.enabled ? "ya" : "tidak"}*`,
      `◦ Mode: *${modeLabel}*`,
      `◦ Whitelist: *${state.whitelist.length} nomor*`,
      `◦ Percobaan tercatat: *${state.log.length}*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}anticulik on / off*`,
      `◦ *${prefix}anticulik mode owner|whitelist*`,
      `◦ *${prefix}anticulik add 628xxx*`,
      `◦ *${prefix}anticulik del 628xxx*`,
      `◦ *${prefix}anticulik list*`,
      `◦ *${prefix}anticulik log*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Bot otomatis keluar bila ditarik orang tak berhak")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const state = getState(db);

    if (!sub || sub === "status") {
      await m.reply(statusText(prefix, state));
      return { handled: true };
    }

    if (sub === "on" || sub === "off") {
      state.enabled = sub === "on";
      if (state.enabled && state.mode === "off") state.mode = "owner";
      saveState(db, state);
      await m.reply(
        alyaHeader("Anti Culik", "🛡️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Anti-culik: *${state.enabled ? "AKTIF" : "NONAKTIF"}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}anticulik status untuk detail`)
      );
      return { handled: true };
    }

    if (sub === "mode") {
      const mode = (args[1] || "").toLowerCase();
      if (!["off", "owner", "whitelist"].includes(mode)) {
        await m.reply(
          alyaHeader("Mode Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ᴘɪʟɪʜᴀɴ", [
              "◦ *owner* — hanya owner",
              "◦ *whitelist* — owner + daftar putih",
              "◦ *off* — nonaktif",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Contoh: ${prefix}anticulik mode whitelist`)
        );
        return { handled: true };
      }
      state.mode = mode;
      saveState(db, state);
      await m.reply(
        alyaHeader("Anti Culik", "🛡️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Mode diubah ke: *${mode}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}anticulik status untuk detail`)
      );
      return { handled: true };
    }

    if (sub === "add" || sub === "del") {
      const num = toNumber(args[1]);
      if (!num) {
        await m.reply(
          alyaHeader("Nomor Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}anticulik ${sub} 628123456789*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Nomor tanpa tanda + dan spasi")
        );
        return { handled: true };
      }

      if (sub === "add") {
        if (!state.whitelist.map(toNumber).includes(num)) state.whitelist.push(num);
      } else {
        state.whitelist = state.whitelist.filter((x) => toNumber(x) !== num);
      }
      saveState(db, state);

      await m.reply(
        alyaHeader("Whitelist", "📝") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Nomor *${num}* ${sub === "add" ? "ditambahkan" : "dihapus"}`,
            `◦ Total whitelist: *${state.whitelist.length}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}anticulik list untuk melihat semua`)
      );
      return { handled: true };
    }

    if (sub === "list") {
      const lines = state.whitelist.length
        ? state.whitelist.map((n, i) => `◦ ${i + 1}. ${toNumber(n)}`)
        : ["◦ Whitelist masih kosong."];
      await m.reply(
        alyaHeader("Whitelist", "📝") +
          "\n\n" +
          bracketBox("📝", "ɴᴏᴍᴏʀ", lines.slice(0, 25)) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}anticulik add <nomor> untuk menambah`)
      );
      return { handled: true };
    }

    if (sub === "log" || sub === "riwayat") {
      const lines = state.log.length
        ? state.log
            .slice(-10)
            .reverse()
            .map((l) => `◦ ${String(l.group).slice(0, 22)} — oleh ${l.by}`)
        : ["◦ Belum ada percobaan tercatat."];
      await m.reply(
        alyaHeader("Log Anti Culik", "📜") +
          "\n\n" +
          bracketBox("📜", "ʀɪᴡᴀʏᴀᴛ", lines) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Menampilkan 10 percobaan terakhir")
      );
      return { handled: true };
    }

    await m.reply(statusText(prefix, state));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}anticulik untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { handleAntiCulik, getState, saveState, toNumber };
