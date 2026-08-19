// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Auth Guard — Sandi sebelum Pairing
 * ---------------------------------------------------------------
 * Sistem autentikasi sandi sebelum bot masuk ke pairing WhatsApp.
 * - Minta sandi di terminal sebelum pairing dimulai
 * - Notifikasi percobaan login (max 3x)
 * - Auto disconnect setelah 3x gagal
 * - Jika benar, lanjut ke pairing
 *
 * Default sandi: Aizat123
 * Bisa di-override via config.session.password atau env BOT_PASSWORD
 */

import readline from "readline";
import * as colors from "./clara-logger.js";

const MAX_ATTEMPTS = 3;

// Default password — bisa di-override dari config atau env
function getPassword(config) {
  return (
    process.env.BOT_PASSWORD ||
    config?.session?.password ||
    "Aizat123"
  );
}

/**
 * Buat interface readline untuk input terminal.
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
}

/**
 * Tanyakan sandi dengan input tersembunyi (hidden input).
 * Karakter yang diketik tidak ditampilkan di terminal.
 */
function askPassword(rl, question) {
  return new Promise((resolve) => {
    process.stdout.write(question);

    // Sembunyikan input
    process.stdin.setRawMode?.(true);
    let input = "";

    const onData = (char) => {
      const c = char.toString();

      if (c === "\r" || c === "\n" || c === "\u0004") {
        // Enter — selesai
        process.stdin.setRawMode?.(false);
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(input);
      } else if (c === "\u0003") {
        // Ctrl+C — exit
        process.stdin.setRawMode?.(false);
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        process.exit(0);
      } else if (c === "\u007f" || c === "\b") {
        // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else if (c >= " ") {
        // Karakter normal — simpan tapi tampilkan *
        input += c;
        process.stdout.write("*");
      }
    };

    process.stdin.on("data", onData);
  });
}

/**
 * Validasi sandi sebelum pairing.
 * Memberikan 3 kesempatan. Jika gagal 3x, bot disconnect.
 *
 * @param {object} config - Config bot
 * @returns {Promise<boolean>} true jika sandi benar, false jika gagal 3x
 */
export async function verifyPassword(config) {
  const password = getPassword(config);

  console.log("");
  console.log(
    colors.createBanner(
      [
        "╔══════════════════════════════╗",
        "║   🔒 AUTH GUARD — SANDI BOT   ║",
        "╚══════════════════════════════╝",
      ],
      "cyan",
    ),
  );
  console.log("");
  colors.logger.info("auth", "Masukkan sandi untuk melanjutkan ke pairing...");
  console.log("");

  const rl = createInterface();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const remaining = MAX_ATTEMPTS - attempt;
    const attemptInfo = `Percobaan ${attempt}/${MAX_ATTEMPTS}`;

    if (attempt > 1) {
      colors.logger.warn("auth", `Percobaan sebelumnya salah! ${attemptInfo}`);
    } else {
      colors.logger.info("auth", attemptInfo);
    }

    const input = await askPassword(rl, "🔑 Masukkan sandi: ");

    if (input === password) {
      console.log("");
      colors.logger.ok("auth", "Sandi benar! Melanjutkan ke pairing...");
      console.log("");
      rl.close();
      return true;
    }

    // Salah
    console.log("");
    if (remaining > 0) {
      colors.logger.warn(
        "auth",
        `❌ Sandi salah! Sisa percobaan: ${remaining}`,
      );
      console.log("");
    }
  }

  // Gagal 3x
  rl.close();
  console.log("");
  console.log(
    colors.createBanner(
      [
        "╔═══════════════════════════════════╗",
        "║  ⛔ PERCobaan HABIS — ACCESS DENIED ║",
        "╚═══════════════════════════════════╝",
      ],
      "red",
    ),
  );
  console.log("");
  colors.logger.error("auth", "3x gagal! Bot akan disconnect...");
  console.log("");
  return false;
}

/**
 * Cek apakah sandi sudah di-set (tidak default).
 */
export function isPasswordSet(config) {
  const pw = getPassword(config);
  return pw !== "Aizat123" && pw.length > 0;
}

/**
 * Validasi sandi tanpa interactive prompt (untuk API/integrasi lain).
 */
export function validatePassword(input, config) {
  return input === getPassword(config);
}

export default { verifyPassword, isPasswordSet, validatePassword };
