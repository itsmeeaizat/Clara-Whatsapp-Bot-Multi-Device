import fs from "fs";
import os from "os";
import path from "path";

const pluginConfig = {
  name: "clearwin",
  alias: ["clearwin"],
  category: "owner",
  description: "Bersihkan temp sistem Windows/OS",
  usage: ".clearwin",
  example: ".clearwin",
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
    const tempDir = process.env.TEMP || process.env.TMP || os.tmpdir();
    let deleted = 0;

    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        try {
          const fp = path.join(tempDir, file);
          const stat = fs.statSync(fp);
          if (stat.isFile()) {
            fs.unlinkSync(fp);
            deleted++;
          }
        } catch {}
      }
    }

    await m.reply(`🧹 Membersihkan temp sistem (${os.platform()})\nLokasi: \`${tempDir}\`\nTotal file dibersihkan: ${deleted}`);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
