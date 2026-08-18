import path from "path";
import fs from "fs";
import config from "./config.js";
import { startConnection, getUptime } from "./src/connection.js";
/* ------------------------------------------------------------------
 * Pemuatan handler pesan
 *
 * Dulu blok ini mencari `handlerMod.messageHandler`, padahal
 * src/handler.js mengekspor `handleMessage`. Karena dijaga
 * `if (typeof ... === "function")` lalu dibungkus `catch {}`, tidak
 * ada error yang muncul — stub kosong dibiarkan terpasang dan bot
 * menjadi bisu total: tidak ada satu pun command yang berjalan.
 *
 * Sekarang nama yang dipakai benar, dan kegagalan memuat handler
 * dilaporkan dengan lantang, bukan ditelan diam-diam.
 * ------------------------------------------------------------------ */
let messageHandler = null;
let handleAntiRemoveFromUpsert = async () => {};

try {
  const handlerMod = await import("./src/handler.js");
  if (typeof handlerMod.handleMessage === "function") {
    messageHandler = handlerMod.handleMessage;
  } else {
    throw new Error("src/handler.js tidak mengekspor handleMessage()");
  }
} catch (error) {
  console.error(
    "\n[FATAL] Gagal memuat src/handler.js — bot tidak akan membalas pesan apa pun.",
  );
  console.error("[FATAL] Penyebab:", error?.message || error);
  console.error("[FATAL] Perbaiki berkas tersebut lalu jalankan ulang.\n");
  process.exit(1);
}

// Antidelete tinggal di clara-group-protection.js, bukan di handler.js.
try {
  const protMod = await import("./src/lib/clara-group-protection.js");
  if (typeof protMod.handleAntiRemoveFromUpsert === "function") {
    handleAntiRemoveFromUpsert = protMod.handleAntiRemoveFromUpsert;
  }
} catch (error) {
  console.warn(
    "[bootstrap] antidelete dinonaktifkan:",
    error?.message || error,
  );
}
import { loadPlugins, pluginStore } from "./src/lib/clara-plugins.js";
import { initDatabase, getDatabase } from "./src/lib/clara-database.js";
import {
  initScheduler,
  loadScheduledMessages,
  startGroupScheduleChecker,
  startSewaChecker,
} from "./src/lib/clara-scheduler.js";
import { handleAntiTagSW } from "./src/lib/clara-group-protection.js";
import {
  logger,
  c,
  playBootSequence,
  spinText,
  logConnection,
  logErrorBox,
  divider,
} from "./src/lib/clara-logger.js";

async function safeDynamicImport(spec) {
  try {
    const mod = await import(spec);
    return mod;
  } catch (error) {
    const missing = String(error?.message || "");
    const name = spec.replace("./", "");
    logger.warn("bootstrap", `dynamic import failed: ${name} -> ${missing}`);
    if (missing.includes("ERR_MODULE_NOT_FOUND") || missing.includes("Cannot find module")) {
      const m = missing.match(/['"](.*?)['"]/);
      const mod = m ? m[1] : "unknown";
      logger.warn("bootstrap", `missing module skipped: ${name} | unresolved: ${mod}`);
    }
    return null;
  }
}

let _initSholatScheduler = null;
let _initNotifScheduler = null;
let _initWeatherScheduler = null;
let _initLokerScheduler = null;
let _initAutoJpmScheduler = null;
let _startMemoryMonitor = null;
let _startTempCleaner = null;
let _startDailyPruner = null;
let _claraAgent = null;

await safeDynamicImport("./src/lib/clara-agent.js").then((m) => { _claraAgent = m; });
_initSholatScheduler = await safeDynamicImport("./src/lib/clara-sholat-scheduler.js").then((m) => typeof m?.initSholatScheduler === "function" ? m.initSholatScheduler : null);
_initNotifScheduler = await safeDynamicImport("./src/lib/clara-notif-scheduler.js").then((m) => typeof m?.initNotifScheduler === "function" ? m.initNotifScheduler : null);
_initWeatherScheduler = await safeDynamicImport("./src/lib/clara-weather-scheduler.js").then((m) => typeof m?.initWeatherScheduler === "function" ? m.initWeatherScheduler : null);
_initLokerScheduler = await safeDynamicImport("./src/lib/clara-loker-scheduler.js").then((m) => typeof m?.initLokerScheduler === "function" ? m.initLokerScheduler : null);
_initAutoJpmScheduler = await safeDynamicImport("./src/lib/clara-auto-jpm.js").then((m) => typeof m?.initAutoJpmScheduler === "function" ? m.initAutoJpmScheduler : null);
_startMemoryMonitor = await safeDynamicImport("./src/lib/clara-memory-monitor.js").then((m) => typeof m?.startMemoryMonitor === "function" ? m.startMemoryMonitor : null);
_startTempCleaner = await safeDynamicImport("./src/lib/clara-temp-cleaner.js").then((m) => typeof m?.startTempCleaner === "function" ? m.startTempCleaner : null);
_startDailyPruner = await safeDynamicImport("./src/lib/clara-data-pruner.js").then((m) => typeof m?.startDailyPruner === "function" ? m.startDailyPruner : null);

try { if (_claraAgent?.initializeAgent) await _claraAgent.initializeAgent(); } catch (e) { logger.warn("AGENT", e?.message || String(e)); }

const LOG_NOISE = new Set([
  "Closing",
  "prekey",
  "_chains",
  "registrationId",
  "chainKey",
  "ephemeralKeyPair",
  "rootKey",
  "indexInfo",
  "pendingPreKey",
  "currentRatchet",
  "baseKey",
  "privKey",
]);
const _log = console.log;
console.log = (...args) => {
  const first = typeof args[0] === "string" ? args[0] : "";
  for (const noise of LOG_NOISE) {
    if (first.includes(noise)) return;
  }
  _log.apply(console, args);
};

const startTime = Date.now();

let pluginWatcher = null;
const reloadDebounce = new Map();
const fileStatCache = new Map();

function startDevWatcher(pluginsPath) {
  if (pluginWatcher) pluginWatcher.close();

  logger.system("dev", "Hot-Reload watcher active for plugins");

  pluginWatcher = fs.watch(
    pluginsPath,
    { recursive: true },
    (eventType, filename) => {
      if (!filename || !filename.endsWith(".js")) return;

      const existingTimeout = reloadDebounce.get(filename);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(async () => {
        reloadDebounce.delete(filename);
        const fullPath = path.join(pluginsPath, filename);

        if (!fs.existsSync(fullPath)) {
          fileStatCache.delete(fullPath);
          const pluginName = path.basename(filename, ".js");
          const { unloadPlugin } = await import("./src/lib/clara-plugins.js");
          const result = unloadPlugin(pluginName);
          if (result.success) logger.warn("plugin", `removed ${filename}`);
          return;
        }

        try {
          const stats = fs.statSync(fullPath);
          const cached = fileStatCache.get(fullPath);
          const changed =
            !cached ||
            cached.mtimeMs !== stats.mtimeMs ||
            cached.size !== stats.size;
          if (!changed) return;

          fileStatCache.set(fullPath, {
            mtimeMs: stats.mtimeMs,
            size: stats.size,
          });

          const { hotReloadPlugin } =
            await import("./src/lib/clara-plugins.js");
          const result = await hotReloadPlugin(fullPath);
          if (!result.success) {
            logger.error(
              "plugin",
              `reload failed: ${filename}: ${result.error}`,
            );
          }
        } catch (error) {
          logger.error(
            "plugin",
            `reload failed: ${filename}: ${error.message}`,
          );
        }
      }, 500);

      reloadDebounce.set(filename, timeout);
    },
  );

  logger.debug("dev", `Monitoring directory: ${pluginsPath}`);
}

let srcWatcher = null;

function startSrcWatcher(srcPath) {
  if (srcWatcher) srcWatcher.close();

  logger.system("dev", "Hot-Reload watcher active for src");

  srcWatcher = fs.watch(srcPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    const existingTimeout = reloadDebounce.get("src_" + filename);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      reloadDebounce.delete("src_" + filename);
      const fullPath = path.join(srcPath, filename);
      if (!fs.existsSync(fullPath)) {
        logger.warn("dev", `src file removed: ${filename}`);
        return;
      }
      logger.success("dev", `src changed: ${filename}`);
    }, 500);

    reloadDebounce.set("src_" + filename, timeout);
  });

  logger.debug("dev", `Monitoring directory: ${srcPath}`);
}

function setupAntiCrash() {
  process.on("uncaughtException", (error, origin) => {
    const ignoredErrors = [
      "write EOF",
      "ECONNRESET",
      "EPIPE",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNREFUSED",
      "read ECONNRESET",
    ];
    const isIgnored = ignoredErrors.some(
      (msg) => error.message?.includes(msg) || error.code === msg,
    );
    if (isIgnored) return;

    logErrorBox("uncaught exception", error.message);
    console.error(c.gray(error.stack));
    logger.system("system", "Engine is still running");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logErrorBox("unhandled rejection", String(reason));
    console.error(c.gray("Promise:"), promise);
    logger.system("system", "Engine is still running");
  });

  process.on("warning", (warning) => {
    logger.warn("system", `${warning.name}: ${warning.message}`);
  });

  process.on("SIGINT", async () => {
    console.log("");
    logger.system("system", "Received STOP signal (SIGINT)");
    logger.info("database", "Saving data to local storage...");
    try {
      const db = getDatabase();
      db.save();
      logger.success("database", "All data successfully saved");
    } catch (error) {
      logger.warn("database", `save failed: ${error.message}`);
    }
    logger.info("system", "Engine stopped safely");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("");
    logger.system("system", "Received TERMINATE signal (SIGTERM)");
    process.exit(0);
  });

  logger.success("system", "Anti-Crash Protection is Active");
}

async function main() {
  await playBootSequence({
    name: config.bot?.name || "Clara-AI",
    version: config.bot?.version || "1.0.0",
    developer: config.bot?.developer || "Developer",
    mode: config.mode || "public",
  });
  setupAntiCrash();

  const dbPath = path.join(
    process.cwd(),
    config.database?.path || "./database/main",
  );
  await initDatabase(dbPath);
  const db = getDatabase();

  await spinText("system", "Starting local asset cache server...", { tone: "accent" });
  try {
  if (typeof preloadAssets === "function") await preloadAssets(config.assets);
} catch (error) {
  logger.warn("assets", `preloadAssets skipped: ${error.message}`);
}

  const savedMode = db.setting("botMode");
  if (savedMode && (savedMode === "self" || savedMode === "public"))
    config.mode = savedMode;
  const savedPremium = db.setting("premiumUsers");
  if (Array.isArray(savedPremium)) config.premiumUsers = savedPremium;
  const savedBanned = db.setting("bannedUsers");
  if (Array.isArray(savedBanned)) config.bannedUsers = savedBanned;

  const pCount = Array.isArray(savedPremium) ? savedPremium.length : 0;
  const bCount = Array.isArray(savedBanned) ? savedBanned.length : 0;
  logger.success(
    "database",
    `Database initialized | Mode: ${config.mode} | Premium: ${pCount} | Banned: ${bCount}`,
  );

  const pluginsPath = path.join(process.cwd(), "plugins");
  const pluginCount = await loadPlugins(pluginsPath);
  logger.success("plugin", `${pluginCount} modules loaded successfully`);

  if (config.dev?.enabled && config.dev?.watchPlugins)
    startDevWatcher(pluginsPath);
  if (config.dev?.enabled && config.dev?.watchSrc) {
    const srcPath = path.join(process.cwd(), "src");
    startSrcWatcher(srcPath);
  }

  try {
    initScheduler(config);
    logger.success("scheduler", "core scheduler initialized");
  } catch (e) {
    logger.warn("scheduler", "core scheduler skipped: " + e.message);
  }

  const bootTime = Date.now() - startTime;
  logger.success("boot", `System initialized in ${bootTime}ms`);
  divider();
  await spinText("network", "Opening WhatsApp connection tunnel...", {
    duration: 900,
    tone: "accent",
  });
  logConnection("connecting", "Establishing session and handshake protocol");
  console.log("");

  await startConnection({
    onRawMessage: async (msg, sock) => {
      try {
        const db = getDatabase();
        await handleAntiTagSW(msg, sock, db);
      } catch (error) {
        if (config.dev?.debugLog) {
          logger.warn("ANTITAGSW", error?.message || String(error));
        }
      }
    },

    onMessage: async (msg, sock) => {
      try {
        // handleMessage(m, sock, botConfig, db, uptime) butuh 5 argumen.
        // Sebelumnya hanya dua yang dikirim, sehingga botConfig, db, dan
        // uptime selalu undefined dan pemrosesan langsung gagal.
        const db = getDatabase();
        const handlerPromise = messageHandler(msg, sock, config, db, getUptime());
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Handler timeout")), 60000),
        );
        await Promise.race([handlerPromise, timeoutPromise]);
      } catch (error) {
        if (error.message !== "Handler timeout") {
          logger.error("HANDLER", error.message);
          if (config.dev?.debugLog) console.error(c.gray(error.stack));
        }
      }
    },

    /* Catatan: onGroupUpdate, onMessageUpdate, dan onGroupSettingsUpdate
     * sengaja tidak dipasang. Ketiganya dulu menunjuk ke stub kosong yang
     * tidak pernah berbuat apa-apa, sementara connection.js sudah memanggil
     * anticulik, welcomecard, dan notifgantitag secara langsung. Memasang
     * callback kosong hanya menambah lapisan tanpa guna. */

    onStubMessage: async (msg, sock) => {
      try {
        const db = getDatabase();
        await handleAntiRemoveFromUpsert(msg, sock, db);
      } catch (error) {
        logger.error("ANTIDELETE", error.message);
      }
    },

    onConnectionUpdate: async (update, sock) => {
      if (update.connection === "open") {
        logConnection("connected", sock.user?.name || "Bot");
        loadScheduledMessages(sock);
        startGroupScheduleChecker(sock);
        startSewaChecker(sock);
        initScheduler(config, sock);
        try { if (_initAutoJpmScheduler) _initAutoJpmScheduler(sock); } catch (e) { logger.warn("JPM", e.message); }
        try { if (_initSholatScheduler) _initSholatScheduler(sock); } catch (e) { logger.warn("SHOLAT", e.message); }
        try { if (_initNotifScheduler) _initNotifScheduler(sock); } catch (e) { logger.warn("NOTIF", e.message); }
        try { if (_initWeatherScheduler) _initWeatherScheduler(sock); } catch (e) { logger.warn("WEATHER", e.message); }
        try { if (_initLokerScheduler) _initLokerScheduler(sock); } catch (e) { logger.warn("LOKER", e.message); }
        try {
          const { initSahurCron } =
            await import("./plugins/religi/autosahur.js");
          initSahurCron(sock);
        } catch (e) { logger.warn("SAHUR", e?.message || String(e)); }
        try {
          const { startOrderPoller } = await import("./src/lib/clara-order-poller.js");
          if (typeof startOrderPoller === "function") {
            try {
              startOrderPoller(sock);
            } catch (e) {
              logger.warn("ORDER", `startOrderPoller failed during start: ${e.message}`);
            }
          } else {
            logger.warn("ORDER", "startOrderPoller not exported or not a function");
          }
        } catch (e) {
          logger.warn("ORDER", `startOrderPoller unavailable: ${e.message}`);
        }
        try {
          const { startOtpPoller: _startOtp } =
            await import("./src/lib/clara-otp-poller.js");
          _startOtp(sock);
        } catch (e) {
          if (e?.code !== "ERR_MODULE_NOT_FOUND") logger.warn("OTP", e?.message || String(e));
        }

        try {
          const { getAllJadibotSessions, restartJadibotSession } =
            await import("./src/lib/clara-jadibot-manager.js");
          const sessions = getAllJadibotSessions();
          if (sessions.length > 0) {
            logger.info("JADIBOT", `Restoring ${sessions.length} session(s)`);
            for (const session of sessions) {
              try {
                await restartJadibotSession(sock, session.id);
                await new Promise((r) => setTimeout(r, 3000));
              } catch (e) {
                logger.error(
                  "JADIBOT",
                  `Failed restore ${session.id}: ${e.message}`,
                );
              }
            }
          }
        } catch (e) {
          logger.error("JADIBOT", `Gagal memulihkan: ${e.message}`);
        }

        const devLabel = config.dev?.enabled ? ` ${c.yellow("• dev")}` : "";
        try { if (_startMemoryMonitor) _startMemoryMonitor(); } catch (e) { logger.warn("MEMORY", e.message); }
        try { if (_startTempCleaner) _startTempCleaner(); } catch (e) { logger.warn("TEMPCLEAN", e.message); }
        try { if (_startDailyPruner) _startDailyPruner(); } catch (e) { logger.warn("PRUNER", e.message); }
        logger.success("ready", `All subsystems are fully operational${devLabel}`);
        divider();
      }
    },
  });
}

main().catch((error) => {
  try {
    console.error("[FATAL] " + (error?.code || "") + " :: " + (error?.message || String(error)));
    if (error?.stack) console.error(error.stack);
    const missing = /Cannot find module ['"](.+?)['"]/.exec(String(error?.message || ""));
    if (missing) console.error("[MISSING] " + missing[1]);
  } catch {}
  logErrorBox("Fatal Error", error.message);
  console.error(c.gray(error.stack));
  process.exit(1);
});
