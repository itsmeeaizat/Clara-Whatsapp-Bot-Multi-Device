// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.join(process.cwd(), "tmp");

function ensureTmp() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
}

function tempPath(ext) {
  ensureTmp();
  return path.join(TMP_DIR, `gcbot_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
}

const pluginConfig = {
  name: "gcbot",
  alias: ["gcbot", "gc", "groupbot", "gcbots"],
  category: "info",
  description: "Lihat daftar grup bot",
  usage: ".gcbot",
  example: ".gcbot",
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

    const groups = [];
    const chats = await sock.groupFetchAllParticipating();
    for (const [jid, meta] of Object.entries(chats || {})) {
      if (!jid?.endsWith("@g.us")) continue;
      const name = meta?.subject || "Grup";
      const count = meta?.participants?.length;
      groups.push(`${name} (${count ?? "-"})`);
    }

    const lines = groups.length
      ? groups.map((name, i) => `${i + 1}. ${name}`)
      : ["◦ Belum ada grup."];

    const text =
      alyaHeader("Grup Bot", "👥") +
      "\n\n" +
      bracketBox("👥", "ɢʀᴜᴘ ʙᴏᴛ", lines) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Total grup: ${groups.length}`) +
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
