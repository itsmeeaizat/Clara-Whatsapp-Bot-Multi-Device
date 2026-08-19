// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Tool Higher or Lower Game
 * Higher or lower number game
 * Usage: .hlh [higher|lower]
 */

const pluginConfig = {
  name: "hlh",
  alias: ["higherlower", "highlower", "tebakangka"],
  category: "tools",
  description: "Higher or lower number game",
  usage: ".hlh <higher|lower>",
  example: ".hlh higher",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

global.hlhGames = global.hlhGames || new Map();

async function handler(m) {
  const prefix = m.prefix || ".";
  const arg = (m.args?.[0] || "").toLowerCase();
  const chatId = m.chat;

  let session = global.hlhGames.get(chatId);

  // Parse choice
  let choice = null;
  if (["higher", "high", "h", "naik", "atas"].includes(arg)) {
    choice = "higher";
  } else if (["lower", "low", "l", "turun", "bawah"].includes(arg)) {
    choice = "lower";
  }

  if (!choice) {
    if (!session) {
      const initNum = Math.floor(Math.random() * 100) + 1;
      session = { number: initNum, score: 0 };
      global.hlhGames.set(chatId, session);

      return m.reply(
        `🎮 *Higher or Lower Game*\n\n` +
        `Angka saat ini: *${initNum}*\n\n` +
        `Apakah angka berikutnya lebih tinggi (higher) atau lebih rendah (lower)?\n` +
        `Pilihan:\n` +
        `• *${prefix}hlh higher* (atau *${prefix}hlh h*)\n` +
        `• *${prefix}hlh lower* (atau *${prefix}hlh l*)`
      );
    } else {
      return m.reply(
        `🎮 *Higher or Lower Game (Sedang Berlangsung)*\n\n` +
        `Angka saat ini: *${session.number}*\n` +
        `Skor saat ini: *${session.score}*\n\n` +
        `Ketik:\n` +
        `• *${prefix}hlh higher* - Jika angka berikutnya > ${session.number}\n` +
        `• *${prefix}hlh lower* - Jika angka berikutnya < ${session.number}`
      );
    }
  }

  if (!session) {
    const initNum = Math.floor(Math.random() * 100) + 1;
    session = { number: initNum, score: 0 };
    global.hlhGames.set(chatId, session);
  }

  const oldNum = session.number;
  const newNum = Math.floor(Math.random() * 100) + 1;

  let win = false;
  if (choice === "higher" && newNum > oldNum) win = true;
  if (choice === "lower" && newNum < oldNum) win = true;

  if (newNum === oldNum) {
    return m.reply(
      `🎲 *SAMA SERI!*\n\n` +
      `Angka sebelumnya: *${oldNum}*\n` +
      `Angka baru: *${newNum}*\n` +
      `Skor tetap: *${session.score}*\n\n` +
      `Silakan tebak lagi: *${prefix}hlh higher* atau *${prefix}hlh lower*`
    );
  }

  if (win) {
    session.score += 1;
    session.number = newNum;
    return m.reply(
      `🎉 *TEBAKAN BENAR!* (+1 poin)\n\n` +
      `Angka sebelumnya: *${oldNum}*\n` +
      `Angka baru: *${newNum}*\n` +
      `Tebakan Anda: *${choice.toUpperCase()}*\n` +
      `Total Skor: *${session.score}*\n\n` +
      `Tebak angka berikutnya vs *${newNum}*:\n` +
      `• *${prefix}hlh higher* atau *${prefix}hlh lower*`
    );
  } else {
    const finalScore = session.score;
    global.hlhGames.delete(chatId);
    return m.reply(
      `💥 *GAMEOVER! Tebakan Salah.*\n\n` +
      `Angka sebelumnya: *${oldNum}*\n` +
      `Angka baru: *${newNum}*\n` +
      `Tebakan Anda: *${choice.toUpperCase()}*\n` +
      `Skor Akhir: *${finalScore}*\n\n` +
      `Ketik *${prefix}hlh* untuk memulai game baru!`
    );
  }
}

export default { config: pluginConfig, handler };
