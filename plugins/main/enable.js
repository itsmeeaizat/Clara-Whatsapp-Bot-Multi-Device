import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "enable",
  alias: ["enable", "disable"],
  category: "main",
  description: "Enable/disable plugin atau fitur bot",
  usage: ".enable <pluginname> / .disable <pluginname>",
  example: ".enable antilink",
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
    const rawText = (m.text || "").trim();
    const args = m.args || (rawText ? rawText.split(/\s+/) : []);

    let isEnable = true;
    let targetPlugin = "";

    if (m.command && m.command.toLowerCase() === "disable") {
      isEnable = false;
      targetPlugin = (args[0] || "").toLowerCase();
    } else {
      const firstArg = (args[0] || "").toLowerCase();
      if (firstArg === "enable" || firstArg === "on") {
        isEnable = true;
        targetPlugin = (args[1] || "").toLowerCase();
      } else if (firstArg === "disable" || firstArg === "off") {
        isEnable = false;
        targetPlugin = (args[1] || "").toLowerCase();
      } else {
        targetPlugin = firstArg;
        if (args[1] && (args[1].toLowerCase() === "off" || args[1].toLowerCase() === "disable")) {
          isEnable = false;
        }
      }
    }

    if (!targetPlugin) {
      return m.reply(`Usage: ${pluginConfig.usage}\nContoh: ${pluginConfig.example}`);
    }

    if (!db.data.settings) db.data.settings = {};
    if (!db.data.settings.plugins) db.data.settings.plugins = {};

    db.data.settings.plugins[targetPlugin] = isEnable;
    db.data.settings[targetPlugin] = isEnable;

    if (m.isGroup && db.data.groups && db.data.groups[m.chat]) {
      db.data.groups[m.chat][targetPlugin] = isEnable;
    }

    await db.write();

    await m.reply(
      `✅ Plugin/fitur *${targetPlugin}* berhasil di-${isEnable ? "aktifkan (ENABLED)" : "nonaktifkan (DISABLED)"}.`
    );
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
