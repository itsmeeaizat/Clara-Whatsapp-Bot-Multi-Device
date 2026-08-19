// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";

const pluginConfig = {
  name: "getfile",
  alias: ["getfile"],
  category: "owner",
  description: "Ambil berkas/file dari server",
  usage: ".getfile <path>",
  example: ".getfile package.json",
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
    const filePath = (m.text || "").trim();
    if (!filePath) {
      return m.reply("❌ Masukkan path file yang ingin diambil!\nUsage: .getfile <path>");
    }

    if (!fs.existsSync(filePath)) {
      return m.reply(`❌ File \`${filePath}\` tidak ditemukan.`);
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return m.reply(`❌ Path \`${filePath}\` adalah direktori, bukan file.`);
    }

    const buffer = fs.readFileSync(filePath);

    if (buffer.length < 3000 && !filePath.endsWith(".png") && !filePath.endsWith(".jpg") && !filePath.endsWith(".mp4")) {
      await m.reply(`📄 *FILE CONTENT: ${filePath}*\n\n\`\`\`\n` + buffer.toString("utf-8") + "\n```");
    } else {
      await sock.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: filePath.split("/").pop(),
          mimetype: "application/octet-stream",
          caption: `📄 *FILE:* \`${filePath}\``,
        },
        { quoted: m }
      );
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
