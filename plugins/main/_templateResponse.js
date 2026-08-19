// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "template",
  alias: ["template", "templateresponse", "settemplate"],
  category: "main",
  description: "Set template response untuk command tertentu",
  usage: ".template <command> <response>",
  example: ".template halo Selamat datang!",
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
    const commandName = (args[0] || "").toLowerCase();
    const responseText = args.slice(1).join(" ").trim();

    if (!commandName) {
      if (!db.data.templates || Object.keys(db.data.templates).length === 0) {
        return m.reply(`Usage: ${pluginConfig.usage}\nContoh: ${pluginConfig.example}`);
      }
      const list = Object.keys(db.data.templates)
        .map((k) => `• ${k}`)
        .join("\n");
      return m.reply(`Usage: ${pluginConfig.usage}\n\n📋 *Daftar Template Response:*\n${list}`);
    }

    if (!db.data.templates) db.data.templates = {};

    if (commandName === "del" || commandName === "delete") {
      const targetCmd = (args[1] || "").toLowerCase();
      if (!targetCmd || !db.data.templates[targetCmd]) {
        return m.reply(`❌ Template untuk command *${targetCmd}* tidak ditemukan!`);
      }
      delete db.data.templates[targetCmd];
      await db.write();
      return m.reply(`✅ Template response untuk *${targetCmd}* berhasil dihapus.`);
    }

    if (!responseText) {
      return m.reply(`Usage: ${pluginConfig.usage}\nContoh: ${pluginConfig.example}`);
    }

    db.data.templates[commandName] = responseText;
    await db.write();
    await m.reply(`✅ Template response untuk command *${commandName}* berhasil disimpan!`);
  } catch (err) {
    await m.reply(`❌ Error: ${err.message}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
