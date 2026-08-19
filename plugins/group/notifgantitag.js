// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Notif Ganti Tag / Label Member
 * ---------------------------------------------------------------
 * WhatsApp mengirim protocolMessage type 30 dengan field memberLabel
 * ketika label/tag seorang member di grup diubah.
 *
 * Hook sudah terpasang di src/connection.js dan memanggil
 * handleLabelChange(msg, sock). Sebelumnya file ini tidak ada sehingga
 * perubahan label tidak pernah diumumkan.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const SETTING_KEY = "notifGantiTag";

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getState(db) {
  try {
    const raw = db?.setting?.(SETTING_KEY);
    if (!raw || typeof raw !== "object") return { groups: {} };
    return { groups: raw.groups && typeof raw.groups === "object" ? raw.groups : {} };
  } catch {
    return { groups: {} };
  }
}

function saveState(db, state) {
  try {
    db?.setting?.(SETTING_KEY, { groups: state.groups });
    return true;
  } catch {
    return false;
  }
}

function isEnabled(db, groupId) {
  const state = getState(db);
  return state.groups[groupId] === true;
}

/* ------------------------------------------------------------------ */
/* Ekstraksi label                                                     */
/* ------------------------------------------------------------------ */

/**
 * Struktur memberLabel bisa berbeda antar versi WhatsApp, jadi
 * dibaca secara defensif dari beberapa kemungkinan field.
 */
function extractLabel(memberLabel) {
  if (!memberLabel || typeof memberLabel !== "object") return {};

  const target =
    memberLabel.jid ||
    memberLabel.participant ||
    memberLabel.target ||
    memberLabel.userJid ||
    "";

  const label =
    memberLabel.label ??
    memberLabel.text ??
    memberLabel.name ??
    memberLabel.newLabel ??
    "";

  const previous =
    memberLabel.previousLabel ?? memberLabel.oldLabel ?? memberLabel.prev ?? "";

  return {
    target: String(target || ""),
    label: String(label || "").trim(),
    previous: String(previous || "").trim(),
  };
}

function num(jid) {
  return String(jid || "").split("@")[0].split(":")[0];
}

/* ------------------------------------------------------------------ */
/* Event handler — dipanggil dari connection.js                        */
/* ------------------------------------------------------------------ */

async function handleLabelChange(msg, sock) {
  try {
    const groupId = msg?.key?.remoteJid || "";
    if (!groupId.endsWith("@g.us")) return false;

    const { getDatabase } = await import("../../src/lib/clara-database.js");
    const db = getDatabase();
    if (!isEnabled(db, groupId)) return false;

    const memberLabel = msg?.message?.protocolMessage?.memberLabel;
    const { target, label, previous } = extractLabel(memberLabel);

    const actor = msg?.participant || msg?.key?.participant || "";
    const actorNum = num(actor);
    const targetNum = num(target);

    const lines = [];
    if (targetNum) lines.push(`◦ Member: @${targetNum}`);
    if (previous && label) lines.push(`◦ Tag: *${previous}* → *${label}*`);
    else if (label) lines.push(`◦ Tag baru: *${label}*`);
    else if (previous) lines.push(`◦ Tag *${previous}* dihapus`);
    else lines.push("◦ Tag member diperbarui");
    if (actorNum) lines.push(`◦ Diubah oleh: @${actorNum}`);

    const text =
      alyaHeader("Ganti Tag", "🏷️") +
      "\n\n" +
      bracketBox("🏷️", "ᴘᴇʀᴜʙᴀʜᴀɴ", lines) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Notifikasi otomatis perubahan label member");

    const mentions = [];
    if (targetNum) mentions.push(`${targetNum}@s.whatsapp.net`);
    if (actorNum) mentions.push(`${actorNum}@s.whatsapp.net`);

    await sock.sendMessage(groupId, { text, mentions });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin command                                                      */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "notifgantitag",
  alias: ["notifgantitag", "notif-ganti-tag", "notiftag", "gantitag", "labelnotif"],
  category: "group",
  description: "Notifikasi otomatis saat tag/label member grup diubah",
  usage: ".notifgantitag <on/off>",
  example: ".notifgantitag on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const sub = ((m.text || "").trim().split(/\s+/)[0] || "").toLowerCase();
    const groupId = m.chat;
    const state = getState(db);
    const active = state.groups[groupId] === true;

    if (sub === "on" || sub === "off") {
      // Hanya admin grup yang boleh mengubah
      // clara-serialize.js sudah menyediakan m.isAdmin dan m.groupMembers.
      // Catatan: m.groupMetadata adalah OBJEK, bukan fungsi.
      let isAdmin = m.isOwner || m.isAdmin === true;
      if (!isAdmin) {
        const gm = Array.isArray(m.groupMembers) && m.groupMembers.length ? m.groupMembers : null;
        const parts = gm || m.groupMetadata?.participants || [];
        isAdmin = parts.some((p) => num(p.id) === num(m.sender) && p.admin);
      }

      if (!isAdmin) {
        await m.reply(
          alyaHeader("Ditolak", "🚫") +
            "\n\n" +
            bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa mengubah ini."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Minta bantuan admin grup")
        );
        return { handled: true };
      }

      state.groups[groupId] = sub === "on";
      if (sub === "off") delete state.groups[groupId];
      saveState(db, state);

      await m.reply(
        alyaHeader("Notif Ganti Tag", "🏷️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Status: *${sub === "on" ? "AKTIF" : "NONAKTIF"}*`,
            sub === "on"
              ? "◦ Bot akan mengumumkan perubahan tag member."
              : "◦ Bot tidak lagi mengumumkan perubahan tag.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}notifgantitag untuk cek status`)
      );
      return { handled: true };
    }

    await m.reply(
      alyaHeader("Notif Ganti Tag", "🏷️") +
        "\n\n" +
        bracketBox("🏷️", "ꜱᴛᴀᴛᴜꜱ", [
          `◦ Grup ini: *${active ? "AKTIF" : "NONAKTIF"}*`,
          `◦ Total grup aktif: *${Object.keys(state.groups).length}*`,
        ]) +
        "\n\n" +
        bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
          `◦ *${prefix}notifgantitag on*`,
          `◦ *${prefix}notifgantitag off*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText("Bot mengumumkan saat label member diubah")
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}notifgantitag untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { handleLabelChange, getState, saveState, isEnabled, extractLabel };
