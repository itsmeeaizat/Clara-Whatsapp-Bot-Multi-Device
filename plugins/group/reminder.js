/**
 * Reminder / Pengingat
 * ---------------------------------------------------------------
 * Pengingat terjadwal per grup maupun pribadi. Checker berjalan
 * tiap 20 detik dan mengirim pengingat yang sudah jatuh tempo.
 *
 * Dukung sekali jalan maupun berulang harian.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { num, parseDuration, humanDuration } from "../../src/lib/clara-group-util.js";

const KEY = "reminderList";
const CHECK_MS = 20_000;
const MAX_PER_CHAT = 20;

let timer = null;
let activeSock = null;

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getAll(db) {
  try {
    const raw = db?.setting?.(KEY);
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveAll(db, list) {
  try {
    db?.setting?.(KEY, list.slice(0, 500));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Checker                                                             */
/* ------------------------------------------------------------------ */

/** Proses satu siklus. Diekspor supaya bisa diuji tanpa menunggu timer. */
async function tick(sock, db, now = Date.now()) {
  const list = getAll(db);
  if (!list.length) return 0;

  const sisa = [];
  let terkirim = 0;

  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    if (r.at > now) {
      sisa.push(r);
      continue;
    }

    const text =
      alyaHeader("Pengingat", "⏰") +
      "\n\n" +
      bracketBox("📌", "ᴘᴇꜱᴀɴ", [`◦ ${r.pesan}`]) +
      "\n\n" +
      bracketBox("ℹ️", "ɪɴꜰᴏ", [
        `◦ Dibuat oleh: @${r.by}`,
        r.ulang ? "◦ Pengingat harian" : "◦ Pengingat sekali",
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Jangan lupa dikerjakan");

    try {
      await sock.sendMessage(r.chat, {
        text,
        mentions: [`${r.by}@s.whatsapp.net`],
      });
      terkirim++;
    } catch {
      // gagal kirim: tetap lanjut, jangan blokir yang lain
    }

    // Jadwalkan ulang bila harian
    if (r.ulang) {
      sisa.push({ ...r, at: r.at + 86400_000 });
    }
  }

  saveAll(db, sisa);
  return terkirim;
}

function startReminderChecker(sock, db) {
  stopReminderChecker();
  activeSock = sock;

  timer = setInterval(async () => {
    try {
      if (!activeSock) return;
      const activeDb =
        db || (await import("../../src/lib/clara-database.js")).getDatabase();
      await tick(activeSock, activeDb);
    } catch {
      // jangan matikan interval karena satu error
    }
  }, CHECK_MS);

  if (typeof timer.unref === "function") timer.unref();
  return { started: true, interval: CHECK_MS };
}

function stopReminderChecker() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  activeSock = null;
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "reminder",
  alias: ["reminder", "ingatkan", "pengingat", "remind", "alarm"],
  category: "tools",
  description: "Pengingat terjadwal, bisa sekali atau berulang harian",
  usage: ".reminder <durasi> <pesan>",
  example: ".reminder 30m rapat tim",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix) {
  return (
    alyaHeader("Pengingat", "⏰") +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}reminder <durasi> <pesan>*`,
      `◦ *${prefix}reminder harian <durasi> <pesan>*`,
      `◦ *${prefix}reminder list* — lihat semua`,
      `◦ *${prefix}reminder hapus <no>*`,
    ]) +
    "\n\n" +
    bracketBox("⏱️", "ᴅᴜʀᴀꜱɪ", ["◦ 30s / 15m / 2h / 1d (maks 30 hari)"]) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}reminder 30m rapat tim`,
      `◦ ${prefix}reminder 1d bayar tagihan`,
      `◦ ${prefix}reminder harian 8h minum obat`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Pengingat dikirim ke chat tempat kamu membuatnya")
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const all = getAll(db);
    const milikChat = all.filter((r) => r.chat === m.chat);

    /* --- list --- */
    if (["list", "daftar", "lihat"].includes(sub)) {
      if (!milikChat.length) {
        await m.reply(
          alyaHeader("Pengingat", "⏰") +
            "\n\n" +
            bracketBox("📭", "ᴋᴏꜱᴏɴɢ", ["◦ Belum ada pengingat di chat ini."]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}reminder 30m <pesan> untuk membuat`)
        );
        return { handled: true };
      }

      const lines = milikChat
        .sort((a, b) => a.at - b.at)
        .slice(0, 15)
        .map((r, i) => {
          const sisa = r.at - Date.now();
          return `◦ ${i + 1}. ${String(r.pesan).slice(0, 30)}\n│     ${sisa > 0 ? humanDuration(sisa) + " lagi" : "segera"}${r.ulang ? " · harian" : ""}`;
        });

      await m.reply(
        alyaHeader("Daftar Pengingat", "📋") +
          "\n\n" +
          bracketBox("⏰", "ᴀᴋᴛɪꜰ", lines) +
          "\n\n" +
          bracketBox("📊", "ᴛᴏᴛᴀʟ", [`◦ *${milikChat.length}* pengingat`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}reminder hapus <nomor> untuk membatalkan`)
      );
      return { handled: true };
    }

    /* --- hapus --- */
    if (["hapus", "batal", "delete", "del"].includes(sub)) {
      const idx = parseInt(args[1], 10) - 1;
      const urut = milikChat.sort((a, b) => a.at - b.at);

      if (!Number.isInteger(idx) || idx < 0 || idx >= urut.length) {
        await m.reply(
          alyaHeader("Nomor Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ Nomor 1 sampai ${urut.length || 0}.`,
              `◦ Contoh: *${prefix}reminder hapus 1*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}reminder list untuk melihat nomor`)
        );
        return { handled: true };
      }

      const target = urut[idx];
      saveAll(db, all.filter((r) => r !== target));

      await m.reply(
        alyaHeader("Dihapus", "🗑️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Pengingat *${String(target.pesan).slice(0, 40)}* dibatalkan.`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}reminder list untuk sisa pengingat`)
      );
      return { handled: true };
    }

    /* --- buat --- */
    const harian = ["harian", "daily", "tiaphari", "ulang"].includes(sub);
    const durasiRaw = harian ? args[1] : args[0];
    const pesan = (harian ? args.slice(2) : args.slice(1)).join(" ").trim();
    const ms = parseDuration(durasiRaw, 30 * 86400_000);

    if (!ms || !pesan) {
      await m.reply(helpText(prefix));
      return { handled: true };
    }

    if (milikChat.length >= MAX_PER_CHAT) {
      await m.reply(
        alyaHeader("Batas Tercapai", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ʟɪᴍɪᴛ", [
            `◦ Maksimal *${MAX_PER_CHAT}* pengingat per chat.`,
            `◦ Hapus sebagian dulu.`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}reminder list untuk melihat`)
      );
      return { handled: true };
    }

    all.push({
      chat: m.chat,
      by: num(m.sender),
      pesan: pesan.slice(0, 200),
      at: Date.now() + ms,
      ulang: harian,
      createdAt: Date.now(),
    });
    saveAll(db, all);

    await m.reply(
      alyaHeader("Pengingat Dibuat", "⏰") +
        "\n\n" +
        bracketBox("📌", "ᴘᴇꜱᴀɴ", [`◦ ${pesan.slice(0, 100)}`]) +
        "\n\n" +
        bracketBox("ℹ️", "ᴊᴀᴅᴡᴀʟ", [
          `◦ Dalam: *${humanDuration(ms)}*`,
          harian ? "◦ Diulang setiap hari" : "◦ Sekali saja",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`${prefix}reminder list untuk melihat semua`)
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}reminder untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { startReminderChecker, stopReminderChecker, tick, getAll, saveAll, KEY };
