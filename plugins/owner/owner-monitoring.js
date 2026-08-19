// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import os from "os";

const pluginConfig = {
  name: "monitoring",
  alias: ["monitoring", "monitor"],
  category: "owner",
  description: "Lihat statistik monitoring server",
  usage: ".monitoring",
  example: ".monitoring",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function formatSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

async function handler(m, { uptime }) {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = process.memoryUsage();

    let txt = `📊 *SERVER MONITORING STATS*\n\n`;
    txt += `◦ *OS Platform:* ${os.platform()} (${os.arch()})\n`;
    txt += `◦ *Node.js:* ${process.version}\n`;
    txt += `◦ *CPU Model:* ${cpus[0]?.model || "N/A"}\n`;
    txt += `◦ *CPU Cores:* ${cpus.length} Cores\n`;
    txt += `◦ *RAM Total:* ${formatSize(totalMem)}\n`;
    txt += `◦ *RAM Used:* ${formatSize(usedMem)} (${((usedMem / totalMem) * 100).toFixed(1)}%)\n`;
    txt += `◦ *RAM Free:* ${formatSize(freeMem)}\n`;
    txt += `◦ *Process RSS:* ${formatSize(memUsage.rss)}\n`;
    txt += `◦ *Heap Used:* ${formatSize(memUsage.heapUsed)}\n`;
    txt += `◦ *System Uptime:* ${formatUptime(os.uptime())}\n`;
    txt += `◦ *Bot Uptime:* ${formatUptime(uptime ? process.uptime() : process.uptime())}\n`;

    await m.reply(txt);
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
