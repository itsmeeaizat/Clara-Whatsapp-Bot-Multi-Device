/**
 * Info — Bot Stats
 * Tampilkan info bot (runtime, memory, total fitur).
 * Usage: .botinfo / .runtime / .statserver
 */

import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

const pluginConfig = {
  name: "botinfo",
  alias: ["botinfo", "runtime", "statserver", "infobot"],
  category: "info",
  description: "Info bot: runtime, memory, total fitur",
  usage: ".botinfo",
  example: ".botinfo",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function formatTime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  let str = "";
  if (d > 0) str += `${d}d `;
  if (h > 0) str += `${h}h `;
  if (m > 0) str += `${m}m `;
  str += `${s}s`;
  return str;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function handler(m, { sock }) {
  try {
    const uptime = formatTime(os.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuCount = os.cpus().length;
    const cpuModel = os.cpus()[0]?.model || "Unknown";
    const platform = `${os.type()} ${os.release()}`;

    // Count total plugins
    const { stdout: pluginCount } = await execAsync(`find plugins/ -name "*.js" | wc -l`).catch(() => ({ stdout: "N/A" }));

    let txt = `📊 *Bot Info*\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `🤖 *Bot:* Clara-MD Modular\n`;
    txt += `⏱️ *Runtime:* ${uptime}\n`;
    txt += `💾 *Memory:* ${formatBytes(usedMem)} / ${formatBytes(totalMem)}\n`;
    txt += `🖥️ *CPU:* ${cpuModel.slice(0, 40)} (${cpuCount} cores)\n`;
    txt += `📦 *Platform:* ${platform}\n`;
    txt += `🔌 *Plugins:* ${pluginCount.trim()}\n`;
    txt += `📡 *Node.js:* ${process.version}\n`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
