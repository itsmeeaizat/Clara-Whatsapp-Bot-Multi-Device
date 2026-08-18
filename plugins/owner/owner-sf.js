import fs from "fs";
import path from "path";

const pluginConfig = {
  name: "sf",
  alias: ["sf", "savefile"],
  category: "owner",
  description: "Simpan/timpa file di server",
  usage: ".sf <path> <content>",
  example: ".sf plugins/test.js console.log('hello');",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  try {
    let filePath = "";
    let content = "";

    if (m.quoted && m.quoted.text) {
      filePath = (m.text || "").trim();
      content = m.quoted.text;
    } else {
      const rawText = (m.text || "").trim();
      const firstSpace = rawText.indexOf(" ");
      if (firstSpace === -1) {
        return m.reply("❌ Masukkan path dan konten file!\nUsage: .sf <path> <content> (atau reply teks dengan .sf <path>)");
      }
      filePath = rawText.slice(0, firstSpace).trim();
      content = rawText.slice(firstSpace + 1).trim();
    }

    if (!filePath) {
      return m.reply("❌ Path file tidak boleh kosong!");
    }

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, "utf-8");
    await m.reply(`✅ Berhasil menyimpan file ke \`${filePath}\` (${content.length} karakter).`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
