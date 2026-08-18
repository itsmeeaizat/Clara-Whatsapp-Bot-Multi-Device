import fs from "fs";
import path from "path";

const pluginConfig = {
  name: "cleartmp",
  alias: ["cleartmp"],
  category: "owner",
  description: "Bersihkan folder tmp",
  usage: ".cleartmp",
  example: ".cleartmp",
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
    const tmpDirs = ["./tmp", "./assets/tmp", path.join(process.cwd(), "tmp")];
    let deletedCount = 0;

    for (const dir of tmpDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file === ".gitignore" || file === ".gitkeep") continue;
          const filePath = path.join(dir, file);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              fs.unlinkSync(filePath);
              deletedCount++;
            }
          } catch {}
        }
      }
    }

    await m.reply(`🧹 Berhasil membersihkan folder tmp!\nTotal file dihapus: ${deletedCount}`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
