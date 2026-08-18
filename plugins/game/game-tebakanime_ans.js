const pluginConfig = {
  name: "tebakanimeans",
  alias: ["tebakanimeans"],
  category: "game",
  description: "Reveal jawaban tebakanime",
  usage: ".tebakanimeans",
  example: ".tebakanimeans",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  try {
    if (!global.tebakanime_sessions) global.tebakanime_sessions = new Map();
    const sess = global.tebakanime_sessions.get(m.chat);
    if (!sess) return await m.reply("Tidak ada game aktif di grup ini.");
    const jawaban = sess.jawaban || sess.answer || "Tidak diketahui";
    global.tebakanime_sessions.delete(m.chat);
    await m.reply("Jawaban: " + jawaban);
  } catch (err) {
    await m.reply("Error: " + String(err.message).slice(0, 100));
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
