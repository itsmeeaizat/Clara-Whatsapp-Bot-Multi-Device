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

  const handled = await handleCommand(m, sock, botConfig, db, uptime);

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
