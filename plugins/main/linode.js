import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "linode",
  alias: ["linode", "server", "vps", "cloud"],
  category: "owner",
  description: "Cek status server/info VPS",
  usage: ".linode",
  example: ".linode",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    let os = "Linux";
    let hostname = "localhost";
    let uptime = "-";
    let cpu = "-";
    let ram = "-";

    try {
      os = process.platform || os;
      hostname = process.env.HOSTNAME || hostname;
      const load = process.platform === "win32" ? "-" : process.uptime ? `${Math.floor(process.uptime() / 60)}m` : "-";
      uptime = load;
      cpu = `${process.usage?.cpu ?? 0}`;
      ram = `${Math.round((process.memoryUsage?.rss ?? 0) / 1024 / 1024)}MB`;
    } catch {}

    const text =
      alyaHeader("Server Info", "☁️") +
      "\n\n" +
      bracketBox("☁️", "ꜱᴇʀᴠᴇʀ", [
        `◦ OS: *${os}*`,
        `◦ Host: *${hostname}*`,
        `◦ Uptime: *${uptime}*`,
        `◦ CPU: *${cpu}*`,
        `◦ RAM: *${ram}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text =
      alyaHeader("Gagal", "❌") +
      "\n\n" +
      bracketBox("❌", "ᴇʀʀᴏʀ", [
        `◦ Status: *Gagal*`,
        `◦ Alasan: *${error.message}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Coba lagi nanti atau hubungi owner`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
