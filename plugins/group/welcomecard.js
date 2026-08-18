/**
 * Welcome Card
 * ---------------------------------------------------------------
 * Mengaktifkan kartu sambutan bergambar untuk member baru/keluar.
 *
 * src/lib/clara-welcome-card.js sudah lama ada (595 baris, 4 generator
 * kartu) tapi TIDAK PERNAH di-import oleh file mana pun — sambutan grup
 * selama ini hanya teks polos. Plugin ini yang memakainya.
 *
 * Dipanggil dari handler grup lewat kirimWelcomeCard().
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
  readGroupState,
  writeGroupState,
} from "../../src/lib/clara-group-util.js";

const KEY = "welcomeCard";

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getCfg(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  if (!raw || typeof raw !== "object") return { enabled: false, gaya: "v4", goodbye: true };
  return {
    enabled: raw.enabled === true,
    gaya: raw.gaya === "discord" ? "discord" : "v4",
    goodbye: raw.goodbye !== false,
  };
}

function saveCfg(db, groupId, cfg) {
  writeGroupState(db, KEY, groupId, cfg.enabled ? cfg : null);
}

/* ------------------------------------------------------------------ */
/* Pembuatan & pengiriman kartu                                        */
/* ------------------------------------------------------------------ */

/**
 * Ambil URL foto profil, aman bila gagal.
 * @returns {Promise<string|null>}
 */
async function ambilAvatar(sock, jid) {
  try {
    return await sock.profilePictureUrl(jid, "image");
  } catch {
    return null; // member tanpa foto / privasi tertutup
  }
}

/**
 * Kirim kartu sambutan/perpisahan.
 * Dipanggil dari event group-participants.update.
 *
 * @returns {Promise<boolean>} true bila kartu terkirim
 */
async function kirimWelcomeCard(sock, db, groupId, jid, opsi = {}) {
  try {
    const cfg = getCfg(db, groupId);
    if (!cfg.enabled) return false;

    const keluar = opsi.keluar === true;
    if (keluar && !cfg.goodbye) return false;

    let groupName = "grup ini";
    let jumlah = 0;
    try {
      const meta = await sock.groupMetadata(groupId);
      groupName = meta?.subject || groupName;
      jumlah = (meta?.participants || []).length;
    } catch {
      // pakai nilai default
    }

    const nomor = num(jid);
    let nama = nomor;
    try {
      const hasil = await sock.onWhatsApp(jid);
      nama = hasil?.[0]?.notify || hasil?.name || nomor;
    } catch {
      // pakai nomor sebagai nama
    }

    const avatar = await ambilAvatar(sock, jid);

    const lib = await import("../../src/lib/clara-welcome-card.js");
    let buffer;

    if (keluar) {
      buffer =
        cfg.gaya === "discord"
          ? await lib.createGoodbyeCard(nama, avatar, groupName, jumlah)
          : await lib.createGoodbyeCardV4(nama, avatar, groupName, jumlah);
    } else {
      buffer =
        cfg.gaya === "discord"
          ? await lib.createWideDiscordCard(nama, avatar, groupName, jumlah)
          : await lib.createWelcomeCardV4(nama, avatar, groupName, jumlah);
    }

    if (!buffer || !buffer.length) return false;

    const caption = keluar
      ? `👋 Selamat tinggal @${nomor}\nSemoga sukses selalu!`
      : `🎉 Selamat datang @${nomor}\nJangan lupa baca aturan grup ya!`;

    await sock.sendMessage(groupId, {
      image: buffer,
      caption,
      mentions: [`${nomor}@s.whatsapp.net`],
    });
    return true;
  } catch {
    // Kartu gagal bukan alasan mengganggu alur join/leave
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "welcomecard",
  alias: ["welcomecard", "kartuwelcome", "wcard", "kartusambutan"],
  category: "group",
  description: "Kartu sambutan bergambar untuk member baru & keluar",
  usage: ".welcomecard <on/off/gaya/test>",
  example: ".welcomecard on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function statusText(prefix, cfg) {
  return (
    alyaHeader("Welcome Card", "🎨") +
    "\n\n" +
    bracketBox("🎨", "ꜱᴛᴀᴛᴜꜱ", [
      `◦ Kartu sambutan: *${cfg.enabled ? "AKTIF" : "NONAKTIF"}*`,
      `◦ Gaya: *${cfg.gaya}*`,
      `◦ Kartu perpisahan: *${cfg.goodbye ? "aktif" : "nonaktif"}*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}welcomecard on / off*`,
      `◦ *${prefix}welcomecard gaya v4|discord*`,
      `◦ *${prefix}welcomecard goodbye on|off*`,
      `◦ *${prefix}welcomecard test* — coba kartunya`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Kartu dikirim otomatis saat ada member masuk/keluar")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa mengatur ini."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}welcomecard untuk lihat status`)
  );
}

async function handler(m, { sock, config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const args = (m.text || "").trim().split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const cfg = getCfg(db, m.chat);

    if (!sub || sub === "status") {
      await m.reply(statusText(prefix, cfg));
      return { handled: true };
    }

    if (sub === "on" || sub === "off") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      cfg.enabled = sub === "on";
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Welcome Card", "🎨") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Status: *${cfg.enabled ? "AKTIF" : "NONAKTIF"}*`,
            cfg.enabled
              ? "◦ Member baru akan disambut kartu bergambar."
              : "◦ Kembali ke sambutan teks biasa.",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(cfg.enabled ? `${prefix}welcomecard test untuk mencoba` : "Aktifkan lagi kapan saja")
      );
      return { handled: true };
    }

    if (sub === "gaya" || sub === "style") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const g = (args[1] || "").toLowerCase();
      if (!["v4", "discord"].includes(g)) {
        await m.reply(
          alyaHeader("Gaya Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ᴘɪʟɪʜᴀɴ", [
              "◦ *v4* — modern gelap (default)",
              "◦ *discord* — lebar ala Discord",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`Contoh: ${prefix}welcomecard gaya v4`)
        );
        return { handled: true };
      }
      cfg.gaya = g;
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Gaya Diubah", "🎨") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Gaya kartu: *${g}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}welcomecard test untuk melihat`)
      );
      return { handled: true };
    }

    if (sub === "goodbye" || sub === "perpisahan") {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      cfg.goodbye = (args[1] || "").toLowerCase() !== "off";
      saveCfg(db, m.chat, cfg);
      await m.reply(
        alyaHeader("Kartu Perpisahan", "👋") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [`◦ Status: *${cfg.goodbye ? "AKTIF" : "NONAKTIF"}*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Berlaku saat ada member keluar")
      );
      return { handled: true };
    }

    if (sub === "test" || sub === "coba" || sub === "preview") {
      const semula = cfg.enabled;
      cfg.enabled = true;
      writeGroupState(db, KEY, m.chat, cfg);

      const okKirim = await kirimWelcomeCard(sock, db, m.chat, m.sender, {
        keluar: (args[1] || "").toLowerCase() === "keluar",
      });

      cfg.enabled = semula;
      saveCfg(db, m.chat, cfg);

      if (!okKirim) {
        await m.reply(
          alyaHeader("Gagal Membuat Kartu", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              "◦ Kartu tidak bisa dibuat saat ini.",
              "◦ Pastikan paket @napi-rs/canvas terpasang.",
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Cek log bot untuk detail")
        );
      }
      return { handled: true };
    }

    await m.reply(statusText(prefix, cfg));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}welcomecard untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { kirimWelcomeCard, getCfg, saveCfg, KEY };
