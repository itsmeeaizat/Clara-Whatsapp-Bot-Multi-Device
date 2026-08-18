import { getDatabase } from "./lib/clara-database.js";
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

let registeredUsers = new Set();

function isRegistered(userId) {
  return registeredUsers.has(String(userId));
}

function markRegistered(userId) {
  registeredUsers.add(String(userId));
}

async function ensureUserRegistered(m, db, botConfig) {
  const userId = String(m.sender || "");
  if (!userId) return false;

  const user = db.getUser(userId);
  if (user) {
    markRegistered(userId);
    return true;
  }

  const defaultName = m.pushName || m.name || "User";
  const username = m.sender?.split("@")[0] || "-";

  db.addUser({
    id: userId,
    name: defaultName,
    username: username,
    role: m.isOwner ? "owner" : "user",
    registeredAt: new Date().toISOString(),
  });

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
  const prefix = botConfig.command?.prefix || ".";
  const text = (m.text || "").trim();

  if (!text.startsWith(prefix)) {
    return false;
  }

  const command = text.slice(prefix.length).split(/[ \n]+/)[0].toLowerCase();
  if (!command) return false;

  const plugin = db.getPlugin(command);
  if (!plugin || !plugin.handler) return false;

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

  if (!isRegistered(userId)) {
    await ensureUserRegistered(m, db, botConfig);
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
  ensureUserRegistered,
  isRegistered,
  markRegistered,
};
