import { getDatabase } from "./lib/clara-database.js";
import { getPlugin } from "./lib/clara-plugins.js";
import {
  notifyNewUser,
  notifyRegistration,
  notifyBroadcast,
} from "./lib/clara-channel-notify.js";

/* ============================================================
   Clara Bot Handler
   - Plugin routing
   - Registration / database
   - Channel notifications
   ============================================================ */

/**
 * Cache pengguna terdaftar.
 *
 * Ini hanya pintasan agar tidak menyentuh database pada setiap pesan.
 * Cache dibatasi jumlahnya supaya tidak tumbuh tanpa henti selama proses
 * hidup, dan bisa dikosongkan bila data pengguna dihapus (mis. .unreg).
 */
const registeredUsers = new Set();
const MAKS_CACHE_USER = 5000;

function isRegistered(userId) {
  return registeredUsers.has(String(userId));
}

function markRegistered(userId) {
  // Buang entri terlama saat penuh; Set mempertahankan urutan penyisipan.
  if (registeredUsers.size >= MAKS_CACHE_USER) {
    const terlama = registeredUsers.values().next().value;
    if (terlama !== undefined) registeredUsers.delete(terlama);
  }
  registeredUsers.add(String(userId));
}

/** Lupakan satu pengguna, dipakai saat pendaftarannya dibatalkan. */
function forgetRegistered(userId) {
  return registeredUsers.delete(String(userId));
}

/** Kosongkan seluruh cache, dipakai saat database direset. */
function clearRegisteredCache() {
  registeredUsers.clear();
}

async function ensureUserRegistered(m, db, botConfig) {
  const userId = String(m.sender || "");
  if (!userId) return false;
  if (!db || typeof db.getUser !== "function") return false;

  const user = db.getUser(userId);
  if (user) {
    markRegistered(userId);
    return true;
  }

  const defaultName = m.pushName || m.name || "User";
  const username = m.sender?.split("@")[0] || "-";

  // API database yang benar adalah setUser(jid, data) — bukan addUser().
  // setUser juga menolak JID grup dengan sendirinya.
  const tersimpan = db.setUser(userId, {
    name: defaultName,
    username: username,
    role: m.isOwner ? "owner" : "user",
    registeredAt: new Date().toISOString(),
  });

  // Bila JID ditolak (mis. JID grup), jangan tandai sebagai terdaftar
  // supaya percobaan berikutnya tidak ikut dilewati.
  if (!tersimpan) return false;

  markRegistered(userId);

  try {
    await notifyNewUser({
      name: defaultName,
      id: userId,
      username: username,
    });
  } catch {
    // ignore channel notification errors
  }

  return true;
}

async function handleCommand(m, sock, botConfig, db, uptime) {
  /*
   * PENTING soal bentuk pesan.
   *
   * clara-serialize.js sudah memisahkan pesan menjadi:
   *   m.body    -> teks utuh, contoh ".ping halo"
   *   m.command -> nama perintah tanpa prefix, contoh "ping"
   *   m.text    -> ARGUMEN SAJA, contoh "halo" (kosong untuk ".ping")
   *
   * Versi lama membaca m.text lalu mencari prefix di dalamnya. Untuk
   * perintah tanpa argumen m.text bernilai "", sehingga tidak pernah
   * cocok dan SELURUH command gagal. Pakai m.command yang sudah
   * disiapkan serializer, dengan m.body sebagai cadangan.
   */
  const prefix = botConfig?.command?.prefix || ".";

  let command = String(m.command || "").toLowerCase();

  if (!command) {
    // Cadangan bila pesan belum diserialisasi (mis. dipanggil dari tes).
    const body = String(m.body ?? m.text ?? "").trim();
    if (!body.startsWith(prefix)) return false;
    command = body.slice(prefix.length).split(/[ \n]+/)[0].toLowerCase();
  }

  if (!command) return false;

  // Registri plugin ada di clara-plugins.js, BUKAN pada objek database.
  // getPlugin() sudah menangani alias, jadi tidak perlu dicari dua kali.
  const plugin = getPlugin(command);
  if (!plugin || typeof plugin.handler !== "function") return false;
  if (plugin.config?.isEnabled === false) return false;

  try {
    const result = await plugin.handler(m, {
      sock,
      config: botConfig,
      db,
      uptime,
    });

    if (result && result.handled) return true;
  } catch (error) {
    console.error(`Plugin error [${command}]:`, error);
  }

  return false;
}

async function handleMessage(m, sock, botConfig, db, uptime) {
  const userId = String(m.sender || "");

  // Pendaftaran tidak boleh menjatuhkan seluruh pemrosesan pesan.
  // Sebelumnya panggilan ini telanjang, sehingga satu error saja
  // membuat pesan tersebut tidak pernah sampai ke plugin mana pun.
  if (!isRegistered(userId)) {
    try {
      await ensureUserRegistered(m, db, botConfig);
    } catch (error) {
      console.error("[handler] gagal mendaftarkan pengguna:", error.message);
    }
  }

  // Pencatatan aktivitas & pengecekan AFK berjalan untuk SEMUA pesan grup,
  // termasuk yang berupa command, supaya statistik tetap akurat.
  if (m.isGroup) {
    try {
      const { catatPesan } = await import("../plugins/group/rekap.js");
      await catatPesan(m, db);
    } catch {
      // plugin rekap tidak tersedia — abaikan
    }

    try {
      const { checkAfk } = await import("../plugins/group/afk.js");
      const afk = await checkAfk(m, db);
      if (afk) {
        await sock.sendMessage(m.chat, {
          text: afk.text,
          mentions: afk.mentions,
        });
      }
    } catch {
      // plugin afk tidak tersedia — abaikan
    }
  }

  // Spam guard diperiksa SEBELUM command diproses, supaya pelaku flood
  // tidak bisa lolos hanya dengan membanjiri command.
  if (m.isGroup) {
    try {
      const { cekSpam } = await import("../plugins/group/spamguard.js");
      if (await cekSpam(m, sock, db)) return true;
    } catch {
      // plugin spamguard tidak tersedia — abaikan
    }
  }

  const handled = await handleCommand(m, sock, botConfig, db, uptime);

  // Listener keyword non-command. Hanya diproses bila pesan tidak cocok
  // dengan plugin mana pun, agar tidak bentrok dengan command.
  if (!handled && m.isGroup) {
    // Giveaway: "ikut" / "join" / "gas"
    try {
      const { tryJoin } = await import("../plugins/group/giveaway.js");
      if (await tryJoin(m, db)) {
        try {
          await sock.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });
        } catch {
          // reaksi opsional
        }
        return true;
      }
    } catch {
      // plugin giveaway tidak tersedia — abaikan
    }

    // Absen: "hadir" / "absen"
    try {
      const { tryAbsen } = await import("../plugins/group/absen.js");
      if (await tryAbsen(m, db)) {
        try {
          await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch {
          // reaksi opsional
        }
        return true;
      }
    } catch {
      // plugin absen tidak tersedia — abaikan
    }

    // Voting: angka polos saat sesi berjalan
    try {
      const { tryVote } = await import("../plugins/group/voting.js");
      const voted = await tryVote(m, db);
      if (voted) {
        try {
          await sock.sendMessage(m.chat, {
            react: { text: voted.ganti ? "🔄" : "🗳️", key: m.key },
          });
        } catch {
          // reaksi opsional
        }
        return true;
      }
    } catch {
      // plugin voting tidak tersedia — abaikan
    }

    // Catatan: pemanggilan cepat "#nama"
    try {
      const { tryCatatan } = await import("../plugins/group/catatan.js");
      const note = await tryCatatan(m, db);
      if (note) {
        await sock.sendMessage(
          m.chat,
          { text: note.isi },
          { quoted: m }
        );
        return true;
      }
    } catch {
      // plugin catatan tidak tersedia — abaikan
    }
  }

  if (!handled && botConfig.registration?.enabled && !m.isOwner && !isRegistered(userId)) {
    // optional: prompt registration
  }

  return handled;
}

export {
  handleMessage,
  handleCommand,
  ensureUserRegistered,
  isRegistered,
  markRegistered,
  forgetRegistered,
  clearRegisteredCache,
};
