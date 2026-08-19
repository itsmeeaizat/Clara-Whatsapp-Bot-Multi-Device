// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const pluginConfig = {
  name: "df",
  alias: ["df"],
  category: "owner",
  description: "Tampilkan informasi ruang disk server",
  usage: ".df",
  example: ".df",
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
    const { stdout, stderr } = await execAsync("df -h").catch((err) => ({ stdout: err.stdout || "", stderr: err.message }));
    const output = stdout || stderr || "Gagal mendapatkan info disk";
    await m.reply("💾 *DISK SPACE INFO*\n\n```\n" + output.trim() + "\n```");
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
