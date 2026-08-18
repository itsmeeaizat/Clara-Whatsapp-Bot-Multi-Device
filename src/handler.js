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

/**
 * Jalankan satu hook plugin opsional dengan aman.
 *
 * Sebelumnya tiap hook dibungkus `catch {}` berkomentar "plugin tidak
 * tersedia". Masalahnya, plugin yang HILANG dan plugin yang RUSAK
 * menghasilkan diam yang sama persis, sehingga bug di dalam plugin grup
 * tidak pernah kelihatan. Sekarang keduanya dibedakan: modul yang memang
 * tidak ada dilewati diam-diam, sedangkan error sungguhan dilaporkan.
 *
 * @param {string} modul - Path modul plugin, relatif terhadap berkas ini
 * @param {string} fungsi - Nama fungsi yang diekspor
 * @param {Function} jalankan - Penerima fungsi tersebut, mengembalikan hasil
 * @returns {Promise<any>} Hasil hook, atau undefined bila dilewati/gagal
 */
async function jalankanHook(modul, fungsi, jalankan) {
  let mod;
  try {
    mod = await import(modul);
  } catch (error) {
    // Hanya modul yang benar-benar tidak ada yang boleh lewat tanpa suara.
    const kode = error?.code;
    if (kode !== "ERR_MODULE_NOT_FOUND" && kode !== "MODULE_NOT_FOUND") {
      console.error(`[handler] gagal memuat ${modul}:`, error?.message || error);
    }
    return undefined;
  }

  const fn = mod?.[fungsi];
  if (typeof fn !== "function") {
    console.error(`[handler] ${modul} tidak mengekspor ${fungsi}()`);
    return undefined;
  }

  try {
    return await jalankan(fn);
  } catch (error) {
    // Error di dalam plugin adalah bug sungguhan — jangan ditelan.
    console.error(`[handler] ${fungsi}() melempar error:`, error?.message || error);
    return undefined;
  }
}

/**
 * Kirim reaksi emoji. Reaksi murni kosmetik, jadi kegagalannya tidak
 * boleh menghentikan apa pun — tetapi tetap dicatat saat debug agar
 * masalah izin atau rate-limit bisa terlihat.
 */
async function beriReaksi(sock, m, emoji) {
  try {
    await sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    return true;
  } catch (error) {
    if (process.env.DEBUG) {
      console.warn("[handler] gagal memberi reaksi:", error?.message || error);
    }
    return false;
  }
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
    await jalankanHook("../plugins/group/rekap.js", "catatPesan", (fn) =>
      fn(m, db),
    );

    const afk = await jalankanHook("../plugins/group/afk.js", "checkAfk", (fn) =>
      fn(m, db),
    );
    if (afk) {
      await sock.sendMessage(m.chat, {
        text: afk.text,
        mentions: afk.mentions,
      });
    }
  }

  // Spam guard diperiksa SEBELUM command diproses, supaya pelaku flood
  // tidak bisa lolos hanya dengan membanjiri command.
  if (m.isGroup) {
    const kenaSpam = await jalankanHook(
      "../plugins/group/spamguard.js",
      "cekSpam",
      (fn) => fn(m, sock, db),
    );
    if (kenaSpam) return true;
  }

  const handled = await handleCommand(m, sock, botConfig, db, uptime);

  // Listener keyword non-command. Hanya diproses bila pesan tidak cocok
  // dengan plugin mana pun, agar tidak bentrok dengan command.
  if (!handled && m.isGroup) {
    // Giveaway: "ikut" / "join" / "gas"
    const ikut = await jalankanHook(
      "../plugins/group/giveaway.js",
      "tryJoin",
      (fn) => fn(m, db),
    );
    if (ikut) {
      await beriReaksi(sock, m, "🎉");
      return true;
    }

    // Absen: "hadir" / "absen"
    const absen = await jalankanHook(
      "../plugins/group/absen.js",
      "tryAbsen",
      (fn) => fn(m, db),
    );
    if (absen) {
      await beriReaksi(sock, m, "✅");
      return true;
    }

    // Voting: angka polos saat sesi berjalan
    const voted = await jalankanHook(
      "../plugins/group/voting.js",
      "tryVote",
      (fn) => fn(m, db),
    );
    if (voted) {
      await beriReaksi(sock, m, voted.ganti ? "🔄" : "🗳️");
      return true;
    }

    // Catatan: pemanggilan cepat "#nama"
    const note = await jalankanHook(
      "../plugins/group/catatan.js",
      "tryCatatan",
      (fn) => fn(m, db),
    );
    if (note) {
      await sock.sendMessage(m.chat, { text: note.isi }, { quoted: m });
      return true;
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
