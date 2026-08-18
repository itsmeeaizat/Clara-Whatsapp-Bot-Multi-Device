const pluginConfig = {
  name: "caklontongans",
  alias: ["caklontongans"],
  category: "game",
  description: "Reveal jawaban caklontong",
  usage: ".caklontongans",
  example: ".caklontongans",
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
    if (!global.caklontong_sessions) global.caklontong_sessions = new Map();
    const sess = global.caklontong_sessions.get(m.chat);
    if (!sess) return await m.reply("Tidak ada game aktif di grup ini.");
    const jawaban = sess.jawaban || sess.answer || "Tidak diketahui";
    global.caklontong_sessions.delete(m.chat);
    await m.reply("Jawaban: " + jawaban);
  } catch (err) {
    await m.reply("Error: " + String(err.message).slice(0, 100));
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
