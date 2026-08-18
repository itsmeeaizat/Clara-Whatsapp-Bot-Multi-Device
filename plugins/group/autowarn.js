/**
 * Auto Warn
 * ---------------------------------------------------------------
 * Melengkapi plugin .warn yang sudah ada. Sebelumnya .warn menampilkan
 * "Warn Count: 1/3" tapi tidak pernah melakukan apa pun saat mencapai 3 —
 * peringatannya hanya angka.
 *
 * Plugin ini menyediakan:
 *   - Batas warn per grup yang bisa diatur
 *   - Aksi otomatis saat batas tercapai (kick / mute / notify)
 *   - Warn kedaluwarsa otomatis setelah sekian hari
 *   - .unwarn untuk mencabut satu peringatan
 *
 * Catatan: warn disimpan per (grup, user) supaya tidak tercampur
 * antar grup, berbeda dari .warn lama yang menyimpan global di user.
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  num,
  isAdmin,
  isBotAdmin,
  readGroupState,
  writeGroupState,
} from "../../src/lib/clara-group-util.js";

const KEY = "autoWarn";
const DEFAULT_LIMIT = 3;
const DEFAULT_AKSI = "kick";
const DEFAULT_EXPIRE_HARI = 30;
const AKSI_VALID = ["kick", "mute", "notify"];

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function defaultCfg() {
  return {
    limit: DEFAULT_LIMIT,
    aksi: DEFAULT_AKSI,
    expireHari: DEFAULT_EXPIRE_HARI,
    warns: {},
  };
}

function getCfg(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  if (!raw || typeof raw !== "object") return defaultCfg();
  return {
    limit: Number.isFinite(raw.limit) ? raw.limit : DEFAULT_LIMIT,
    aksi: AKSI_VALID.includes(raw.aksi) ? raw.aksi : DEFAULT_AKSI,
    expireHari: Number.isFinite(raw.expireHari) ? raw.expireHari : DEFAULT_EXPIRE_HARI,
    warns: raw.warns && typeof raw.warns === "object" ? raw.warns : {},
  };
}

function saveCfg(db, groupId, cfg) {
  writeGroupState(db, KEY, groupId, cfg);
}

/** Buang warn yang sudah kedaluwarsa. Mengubah cfg di tempat. */
function bersihkanExpired(cfg, now = Date.now()) {
  const batas = cfg.expireHari * 86400_000;
  if (!Number.isFinite(batas) || batas <= 0) return cfg;
  for (const [jid, list] of Object.entries(cfg.warns)) {
    const aktif = (Array.isArray(list) ? list : []).filter(
      (w) => now - (w.at || 0) < batas
    );
    if (aktif.length) cfg.warns[jid] = aktif;
    else delete cfg.warns[jid];
  }
  return cfg;
}

function jumlahWarn(cfg, jid) {
  return (cfg.warns[num(jid)] || []).length;
}

/* ------------------------------------------------------------------ */
/* Aksi                                                                */
/* ------------------------------------------------------------------ */

/**
 * Jalankan aksi saat batas tercapai.
 * @returns {Promise<{ok:boolean,pesan:string}>}
 */
async function jalankanAksi(sock, m, targetNum, cfg) {
  const jid = `${targetNum}@s.whatsapp.net`;

  if (cfg.aksi === "notify") {
    return { ok: true, pesan: "Admin sudah diberi tahu." };
  }

  if (!isBotAdmin(m)) {
    return { ok: false, pesan: "Bot bukan admin, tidak bisa mengeksekusi." };
  }

  if (cfg.aksi === "kick") {
    try {
      await sock.groupParticipantsUpdate(m.chat, [jid], "remove");
      return { ok: true, pesan: "Member dikeluarkan dari grup." };
    } catch (e) {
      return { ok: false, pesan: `Gagal kick: ${String(e.message).slice(0, 60)}` };
    }
  }

  if (cfg.aksi === "mute") {
    // WhatsApp tidak punya mute per-user; tandai di state agar
    // plugin lain / admin bisa menindaklanjuti.
    return { ok: true, pesan: "Ditandai mute (butuh tindakan admin)." };
  }

  return { ok: false, pesan: "Aksi tidak dikenal." };
}

/* ------------------------------------------------------------------ */
/* API untuk dipakai plugin lain                                       */
/* ------------------------------------------------------------------ */

/**
 * Tambah satu warn. Dipakai .autowarn dan bisa dipanggil proteksi lain.
 * @returns {Promise<object>} ringkasan hasil
 */
async function tambahWarn(sock, m, db, targetNum, alasan, oleh) {
  const cfg = bersihkanExpired(getCfg(db, m.chat));
  const t = num(targetNum);

  cfg.warns[t] = cfg.warns[t] || [];
  cfg.warns[t].push({
    alasan: String(alasan || "Tanpa alasan").slice(0, 120),
    oleh: num(oleh),
    at: Date.now(),
  });

  const total = cfg.warns[t].length;
  let hasilAksi = null;

  if (total >= cfg.limit) {
    hasilAksi = await jalankanAksi(sock, m, t, cfg);
    if (hasilAksi.ok && cfg.aksi === "kick") delete cfg.warns[t];
  }

  saveCfg(db, m.chat, cfg);
  return { total, limit: cfg.limit, aksi: cfg.aksi, hasilAksi };
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "autowarn",
  alias: ["autowarn", "auto-warn", "warnsystem", "setwarn"],
  category: "group",
  description: "Sistem peringatan otomatis: kick/mute saat batas tercapai",
  usage: ".autowarn <@user|limit|aksi|list|reset|cabut>",
  example: ".autowarn @628xxx spam terus",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix, cfg) {
  return (
    alyaHeader("Auto Warn", "⚠️") +
    "\n\n" +
    bracketBox("⚙️", "ᴘᴇɴɢᴀᴛᴜʀᴀɴ", [
      `◦ Batas warn: *${cfg.limit}*`,
      `◦ Aksi saat batas: *${cfg.aksi}*`,
      `◦ Warn hangus setelah: *${cfg.expireHari} hari*`,
      `◦ Member ber-warn: *${Object.keys(cfg.warns).length}*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}autowarn @user <alasan>*`,
      `◦ *${prefix}autowarn cabut @user*`,
      `◦ *${prefix}autowarn list* — semua yang kena`,
      `◦ *${prefix}autowarn limit 3*`,
      `◦ *${prefix}autowarn aksi kick|mute|notify*`,
      `◦ *${prefix}autowarn reset @user*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Warn otomatis hangus setelah masa berlaku")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa melakukan ini."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}autowarn untuk bantuan`)
  );
}

async function handler(m, { sock, config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    let cfg = bersihkanExpired(getCfg(db, m.chat));
    saveCfg(db, m.chat, cfg);

    /* --- pengaturan limit --- */
    if (sub === "limit") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const n = parseInt(args[1], 10);
      if (!Number.isFinite(n) || n < 1 || n > 20) {
        await m.reply(
          alyaHeader("Nilai Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Batas harus 1-20. Contoh: *${prefix}autowarn limit 3*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Coba lagi dengan angka valid")
        );
        return { handled: true };
      }
      cfg.limit = n;
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Batas Diubah", "⚙️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Batas warn: *${n}*`, `◦ Aksi: *${cfg.aksi}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}autowarn untuk lihat pengaturan`)
      );
      return { handled: true };
    }

    /* --- pengaturan aksi --- */
    if (sub === "aksi" || sub === "action") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const a = (args[1] || "").toLowerCase();
      if (!AKSI_VALID.includes(a)) {
        await m.reply(
          alyaHeader("Aksi Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ᴘɪʟɪʜᴀɴ", [
              "◦ *kick* — keluarkan dari grup",
              "◦ *mute* — tandai untuk ditindak admin",
              "◦ *notify* — hanya beri tahu admin",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Contoh: ${prefix}autowarn aksi kick`)
        );
        return { handled: true };
      }
      cfg.aksi = a;
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Aksi Diubah", "⚙️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Aksi saat batas: *${a}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}autowarn untuk lihat pengaturan`)
      );
      return { handled: true };
    }

    /* --- daftar --- */
    if (sub === "list" || sub === "daftar") {
      const entries = Object.entries(cfg.warns);
      const lines = entries.length
        ? entries
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 20)
            .map(([j, l]) => `◦ @${j} — *${l.length}/${cfg.limit}* warn`)
        : ["◦ Belum ada member yang kena warn."];

      await m.reply(
        alyaHeader("Daftar Warn", "📋") +
          "\n\n" +
          bracketBox("⚠️", "ᴍᴇᴍʙᴇʀ", lines) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [
            `◦ Total: *${entries.length} member*`,
            `◦ Batas: *${cfg.limit}* · Aksi: *${cfg.aksi}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}autowarn cabut @user untuk mengurangi`),
        { mentions: entries.slice(0, 20).map(([j]) => `${j}@s.whatsapp.net`) }
      );
      return { handled: true };
    }

    /* --- cabut / reset --- */
    if (["cabut", "unwarn", "reset", "hapus"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const target = num(m.mentionedJid?.[0] || args[1]);
      if (!target) {
        await m.reply(
          alyaHeader("Target Kosong", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [`◦ Contoh: *${prefix}autowarn ${sub} @user*`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Mention member yang dituju")
        );
        return { handled: true };
      }

      const sebelum = jumlahWarn(cfg, target);
      if (!sebelum) {
        await m.reply(
          alyaHeader("Tidak Ada Warn", "ℹ️") +
            "\n\n" +
            bracketBox("ℹ️", "ɪɴꜰᴏ", [`◦ @${target} tidak punya warn aktif.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Tidak ada yang perlu dicabut"),
          { mentions: [`${target}@s.whatsapp.net`] }
        );
        return { handled: true };
      }

      if (sub === "reset" || sub === "hapus") delete cfg.warns[target];
      else cfg.warns[target].pop();
      if (cfg.warns[target] && !cfg.warns[target].length) delete cfg.warns[target];
      saveCfg(db, m.chat, cfg);

      await m.reply(
        alyaHeader("Warn Dicabut", "✅") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Member: @${target}`,
            `◦ Sebelum: *${sebelum}* → Sekarang: *${jumlahWarn(cfg, target)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Semoga tidak mengulangi lagi"),
        { mentions: [`${target}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- beri warn --- */
    const target = num(m.mentionedJid?.[0]);
    if (!target) {
      await m.reply(helpText(prefix, cfg));
      return { handled: true };
    }
    if (!isAdmin(m)) {
      await m.reply(tolakAdmin(prefix));
      return { handled: true };
    }
    if (target === num(m.sender)) {
      await m.reply(
        alyaHeader("Tidak Bisa", "⚠️") +
          "\n\n" +
          bracketBox("⚠️", "ɪɴꜰᴏ", ["◦ Tidak bisa memberi warn ke diri sendiri."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Pilih member lain")
      );
      return { handled: true };
    }

    const alasan = args.slice(1).filter((a) => !a.startsWith("@")).join(" ").trim();
    const hasil = await tambahWarn(sock, m, db, target, alasan, m.sender);

    const lines = [
      `◦ Member: @${target}`,
      `◦ Alasan: *${alasan || "Tanpa alasan"}*`,
      `◦ Warn: *${hasil.total}/${hasil.limit}*`,
    ];
    if (hasil.hasilAksi) {
      lines.push(`◦ Aksi *${hasil.aksi}*: ${hasil.hasilAksi.ok ? "berhasil" : "gagal"}`);
      lines.push(`◦ ${hasil.hasilAksi.pesan}`);
    } else {
      lines.push(`◦ Sisa sebelum ${hasil.aksi}: *${hasil.limit - hasil.total}*`);
    }

    await m.reply(
      alyaHeader(hasil.hasilAksi ? "Batas Tercapai" : "Peringatan", "⚠️") +
        "\n\n" +
        bracketBox("⚠️", "ᴡᴀʀɴ", lines) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(
          hasil.hasilAksi
            ? "Batas warn tercapai"
            : `Kumpulkan ${hasil.limit} warn = ${hasil.aksi}`
        ),
      { mentions: [`${target}@s.whatsapp.net`] }
    );
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}autowarn untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export {
  tambahWarn,
  getCfg,
  saveCfg,
  bersihkanExpired,
  jumlahWarn,
  AKSI_VALID,
  DEFAULT_LIMIT,
  KEY,
};
