// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { exec } from "child_process";

const pluginConfig = {
  name: "exec",
  alias: ["exec", "execute"],
  category: "owner",
  description: "Jalankan perintah shell/bash",
  usage: ".exec <command>",
  example: ".exec ls -la",
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
    const cmd = (m.text || "").trim();
    if (!cmd) {
      return m.reply("❌ Masukkan perintah shell yang ingin dijalankan!\nUsage: .exec <command>");
    }

    exec(cmd, { timeout: 30000 }, async (error, stdout, stderr) => {
      let result = "";
      if (stdout) result += stdout;
      if (stderr) result += (result ? "\n--- STDERR ---\n" : "") + stderr;
      if (error && !result) result = `Error: ${error.message}`;

      await m.reply("🖥️ *SHELL OUTPUT*\n\n```\n" + (result.trim() || "Selesai (tanpa output)") + "\n```");
    });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
