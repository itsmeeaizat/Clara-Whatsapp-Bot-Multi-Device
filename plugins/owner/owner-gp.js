import fs from "fs";
import path from "path";

const pluginConfig = {
  name: "gp",
  alias: ["gp", "getplugin"],
  category: "owner",
  description: "Ambil file plugin bot",
  usage: ".gp <pluginname>",
  example: ".gp group/promote.js",
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
    let name = (m.text || "").trim();
    if (!name) {
      return m.reply("❌ Masukkan nama plugin!\nUsage: .gp <pluginname>");
    }

    if (!name.endsWith(".js")) name += ".js";

    let targetPath = path.join("plugins", name);

    if (!fs.existsSync(targetPath)) {
      const searchPlugin = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const f of files) {
          const res = path.join(dir, f.name);
          if (f.isDirectory()) {
            const found = searchPlugin(res);
            if (found) return found;
          } else if (f.name === name || f.name === name.replace(/\.js$/, "") + ".js") {
            return res;
          }
        }
        return null;
      };

      const found = searchPlugin("plugins");
      if (found) targetPath = found;
    }

    if (!fs.existsSync(targetPath)) {
      return m.reply(`❌ Plugin \`${name}\` tidak ditemukan di folder plugins/`);
    }

    const content = fs.readFileSync(targetPath, "utf-8");

    if (content.length < 3000) {
      await m.reply(`🧩 *PLUGIN: ${targetPath}*\n\n\`\`\`javascript\n` + content + "\n```");
    } else {
      await sock.sendMessage(
        m.chat,
        {
          document: Buffer.from(content),
          fileName: path.basename(targetPath),
          mimetype: "text/javascript",
          caption: `🧩 *PLUGIN:* \`${targetPath}\``,
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
