// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";

const pluginConfig = {
  name: "getdb",
  alias: ["getdb"],
  category: "owner",
  description: "Ambil file database bot",
  usage: ".getdb",
  example: ".getdb",
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
    const possiblePaths = [
      "./database/main/users.json",
      "./src/database/users.json",
      "./database/users.json",
    ];

    let foundPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!foundPath) {
      if (fs.existsSync("./database/main")) {
        const files = fs.readdirSync("./database/main").filter((f) => f.endsWith(".json"));
        if (files.length > 0) foundPath = path.join("./database/main", files[0]);
      }
    }

    if (!foundPath) {
      return m.reply("❌ File database tidak ditemukan di server.");
    }

    const buffer = fs.readFileSync(foundPath);
    const filename = path.basename(foundPath);

    await sock.sendMessage(
      m.chat,
      {
        document: buffer,
        fileName: filename,
        mimetype: "application/json",
        caption: `📁 *DATABASE BOT*\nFile: \`${foundPath}\``
      },
      { quoted: m }
    );
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
