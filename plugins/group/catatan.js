/**
 * Catatan Grup
 * ---------------------------------------------------------------
 * Catatan bersama yang bisa dipanggil kapan saja: aturan grup,
 * link penting, nomor rekening, resep, dsb.
 *
 * Dukung pemanggilan cepat lewat #nama supaya tidak perlu
 * mengetik command panjang.
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

const KEY = "catatanGrup";
const MAX_CATATAN = 50;
const MAX_PANJANG = 2000;

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

function getAll(db, groupId) {
  const raw = readGroupState(db, KEY, groupId, null);
  return raw && typeof raw === "object" ? raw : {};
}

function saveAll(db, groupId, data) {
  writeGroupState(db, KEY, groupId, Object.keys(data).length ? data : null);
}

/** Normalisasi nama catatan: huruf kecil, tanpa spasi berlebih. */
function normNama(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

/* ------------------------------------------------------------------ */
/* Pemanggilan cepat #nama                                             */
/* ------------------------------------------------------------------ */

/**
 * Dipanggil handler untuk pesan non-command.
 * Bila pesan berbentuk "#nama", kembalikan isi catatannya.
 * @returns {Promise<null|{nama:string,isi:string}>}
 */
async function tryCatatan(m, db) {
  try {
    if (!m?.isGroup) return null;
    const raw = String(m.text || "").trim();
    if (!raw.startsWith("#") || raw.length < 2 || raw.includes("\n")) return null;

    const nama = normNama(raw.slice(1));
    if (!nama) return null;

    const all = getAll(db, m.chat);
    const c = all[nama];
    if (!c) return null;

    // Hitung pemakaian agar bisa lihat catatan mana yang berguna
    c.dipakai = (c.dipakai || 0) + 1;
    all[nama] = c;
    saveAll(db, m.chat, all);

    return { nama, isi: c.isi };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Plugin                                                              */
/* ------------------------------------------------------------------ */

const pluginConfig = {
  name: "catatan",
  alias: ["catatan", "note", "notes", "memo", "simpan"],
  category: "group",
  description: "Catatan bersama grup, panggil cepat dengan #nama",
  usage: ".catatan <simpan|lihat|hapus|list>",
  example: ".catatan simpan aturan Dilarang spam",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function helpText(prefix, jumlah) {
  return (
    alyaHeader("Catatan Grup", "📝") +
    "\n\n" +
    bracketBox("📝", "ᴀᴘᴀ ɪɴɪ", [
      "◦ Simpan info penting grup.",
      "◦ Panggil cepat dengan *#nama*.",
      `◦ Tersimpan: *${jumlah} catatan*`,
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴘᴇʀɪɴᴛᴀʜ", [
      `◦ *${prefix}catatan simpan <nama> <isi>*`,
      `◦ *${prefix}catatan lihat <nama>*`,
      `◦ *${prefix}catatan hapus <nama>*`,
      `◦ *${prefix}catatan list*`,
    ]) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}catatan simpan aturan Dilarang spam`,
      "◦ Panggil dengan: *#aturan*",
      `◦ Balas pesan + ${prefix}catatan simpan <nama>`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Simpan & hapus khusus admin grup")
  );
}

function tolakAdmin(prefix) {
  return (
    alyaHeader("Ditolak", "🚫") +
    "\n\n" +
    bracketBox("🚫", "ᴀᴋꜱᴇꜱ", ["◦ Hanya admin grup yang bisa menyimpan/menghapus."]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}catatan list untuk melihat`)
  );
}

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const raw = (m.text || "").trim();
    const args = raw.split(/\s+/).filter(Boolean);
    const sub = (args[0] || "").toLowerCase();
    const all = getAll(db, m.chat);

    /* --- simpan --- */
    if (["simpan", "set", "add", "tambah", "buat"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };

      const nama = normNama(args[1]);
      // Isi bisa dari argumen, atau dari pesan yang di-reply
      let isi = raw.slice(sub.length).trim().slice(args[1]?.length || 0).trim();
      if (!isi && m.quoted?.text) isi = String(m.quoted.text).trim();

      if (!nama || !isi) {
        await m.reply(
          alyaHeader("Format Salah", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ɪɴꜰᴏ", [
              `◦ *${prefix}catatan simpan <nama> <isi>*`,
              `◦ Atau balas pesan lalu *${prefix}catatan simpan <nama>*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Nama tanpa spasi, contoh: aturan")
        );
        return { handled: true };
      }

      const baru = !all[nama];
      if (baru && Object.keys(all).length >= MAX_CATATAN) {
        await m.reply(
          alyaHeader("Penuh", "⚠️") +
            "\n\n" +
            bracketBox("⚠️", "ʙᴀᴛᴀꜱ", [`◦ Maksimal *${MAX_CATATAN}* catatan per grup.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Hapus sebagian dulu")
        );
        return { handled: true };
      }

      all[nama] = {
        isi: isi.slice(0, MAX_PANJANG),
        oleh: num(m.sender),
        at: Date.now(),
        dipakai: all[nama]?.dipakai || 0,
      };
      saveAll(db, m.chat, all);

      await m.reply(
        alyaHeader(baru ? "Catatan Disimpan" : "Catatan Diperbarui", "📝") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ Nama: *${nama}*`,
            `◦ Panjang: *${isi.length} karakter*`,
            `◦ Panggil dengan: *#${nama}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Total: ${Object.keys(all).length} catatan`)
      );
      return { handled: true };
    }

    /* --- lihat --- */
    if (["lihat", "get", "buka", "baca"].includes(sub)) {
      const nama = normNama(args[1]);
      const c = all[nama];
      if (!c) {
        await m.reply(
          alyaHeader("Tidak Ditemukan", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Catatan *${nama || "(kosong)"}* tidak ada.`,
              `◦ Lihat semua: *${prefix}catatan list*`,
            ]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText("Periksa lagi namanya")
        );
        return { handled: true };
      }

      await m.reply(
        alyaHeader(nama, "📄") +
          "\n\n" +
          c.isi +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Dibuat oleh @${c.oleh} · dipakai ${c.dipakai || 0}x`),
        { mentions: [`${c.oleh}@s.whatsapp.net`] }
      );
      return { handled: true };
    }

    /* --- hapus --- */
    if (["hapus", "del", "delete", "buang"].includes(sub)) {
      if (!isAdmin(m)) return await m.reply(tolakAdmin(prefix)), { handled: true };
      const nama = normNama(args[1]);
      if (!all[nama]) {
        await m.reply(
          alyaHeader("Tidak Ditemukan", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Catatan *${nama || "(kosong)"}* tidak ada.`]) +
            "\n\n" +
            separator() +
            "\n" +
            tipText(`${prefix}catatan list untuk melihat`)
        );
        return { handled: true };
      }
      delete all[nama];
      saveAll(db, m.chat, all);

      await m.reply(
        alyaHeader("Catatan Dihapus", "🗑️") +
          "\n\n" +
          bracketBox("✅", "ʙᴇʀʜᴀꜱɪʟ", [
            `◦ *${nama}* dihapus.`,
            `◦ Sisa: *${Object.keys(all).length} catatan*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`${prefix}catatan list untuk sisanya`)
      );
      return { handled: true };
    }

    /* --- list --- */
    if (!sub || ["list", "daftar", "semua"].includes(sub)) {
      const entries = Object.entries(all);
      if (!entries.length) {
        await m.reply(helpText(prefix, 0));
        return { handled: true };
      }
      const lines = entries
        .sort((a, b) => (b[1].dipakai || 0) - (a[1].dipakai || 0))
        .slice(0, 40)
        .map(([n2, c]) => `◦ *#${n2}* — ${String(c.isi).slice(0, 28)}${c.isi.length > 28 ? "…" : ""}`);

      await m.reply(
        alyaHeader("Daftar Catatan", "📚") +
          "\n\n" +
          bracketBox("📚", "ᴛᴇʀꜱɪᴍᴘᴀɴ", lines) +
          "\n\n" +
          bracketBox("📊", "ɪɴꜰᴏ", [
            `◦ Total: *${entries.length} catatan*`,
            "◦ Panggil dengan *#nama*",
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Diurutkan dari yang paling sering dipakai")
      );
      return { handled: true };
    }

    // ".catatan aturan" -> anggap ingin melihat
    const nama = normNama(sub);
    if (all[nama]) {
      const c = all[nama];
      await m.reply(
        alyaHeader(nama, "📄") +
          "\n\n" +
          c.isi +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Panggil cepat: #${nama}`)
      );
      return { handled: true };
    }

    await m.reply(helpText(prefix, Object.keys(all).length));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 150)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}catatan untuk bantuan`)
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { tryCatatan, normNama, getAll, saveAll, KEY };
