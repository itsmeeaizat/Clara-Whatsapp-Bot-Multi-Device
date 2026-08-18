const pluginConfig = {
  name: "tebakbenderaans",
  alias: ["tebakbenderaans"],
  category: "game",
  description: "Reveal jawaban tebakbendera",
  usage: ".tebakbenderaans",
  example: ".tebakbenderaans",
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
    if (!global.tebakbendera_sessions) global.tebakbendera_sessions = new Map();
    const sess = global.tebakbendera_sessions.get(m.chat);
    if (!sess) return await m.reply("Tidak ada game aktif di grup ini.");
    const jawaban = sess.jawaban || sess.answer || "Tidak diketahui";
    global.tebakbendera_sessions.delete(m.chat);
    await m.reply("Jawaban: " + jawaban);
  } catch (err) {
    await m.reply("Error: " + String(err.message).slice(0, 100));
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
