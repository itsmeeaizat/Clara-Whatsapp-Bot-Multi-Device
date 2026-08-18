import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "cmdwithmedia",
  alias: ["cmdwithmedia", "setcmdmedia", "cmdmedia"],
  category: "main",
  description: "Set command untuk merespons dengan media (balas media)",
  usage: ".cmdwithmedia <command> (reply to media)",
  example: ".cmdwithmedia menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const args = m.args || (m.text ? m.text.trim().split(/\s+/) : []);
    const commandName = (args[0] || "").trim().toLowerCase();

    if (!commandName) {
      return m.reply(`Usage: ${pluginConfig.usage}\nContoh: ${pluginConfig.example}`);
    }

    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || "";

    if (!q || (!mime && !q.fileSha256)) {
      return m.reply("❌ Silakan balas (reply) media atau stiker yang ingin didaftarkan!");
    }

    if (!db.data.cmdWithMedia) db.data.cmdWithMedia = {};
    if (!db.data.sticker) db.data.sticker = {};

    const shaHash = q.fileSha256 ? Buffer.from(q.fileSha256).toString("base64") : null;

    db.data.cmdWithMedia[commandName] = {
      command: commandName,
      hash: shaHash,
      mime: mime,
      mentionedJid: m.mentionedJid || [],
      chat: m.chat,
      updatedAt: Date.now(),
    };

    if (shaHash) {
      db.data.sticker[shaHash] = {
        text: commandName,
        mentionedJid: m.mentionedJid || [],
      };
    }

    await db.write();
    await m.reply(`✅ Berhasil mendaftarkan media untuk command: *${commandName}*`);
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
