const pluginConfig = {
  name: "leavegc",
  alias: ["leavegc", "leave"],
  category: "owner",
  description: "Keluar dari grup saat ini / target grup",
  usage: ".leavegc",
  example: ".leavegc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const targetChat = (m.text || "").trim() || (m.isGroup ? m.chat : null);

    if (!targetChat || !targetChat.endsWith("@g.us")) {
      return m.reply("❌ Perintah ini harus dijalankan di dalam grup atau masukkan ID grup!\nUsage: .leavegc <groupid>");
    }

    await m.reply("👋 *Bot akan keluar dari grup ini. Terima kasih!*");
    await sock.groupLeave(targetChat);
  } catch (err) {
    await m.reply(`❌ Gagal keluar grup: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
