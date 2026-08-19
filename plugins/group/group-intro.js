// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { participantsOf } from "../../src/lib/clara-group-util.js";

const pluginConfig = {
  name: "intro",
  alias: ["intro", "groupintro", "grupintro", "gcintro"],
  category: "group",
  description: "Show group info",
  usage: ".intro",
  example: ".intro",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    if (!m.isGroup) return m.reply("Command ini hanya untuk grup!");

    const prefix = botConfig?.command?.prefix || ".";

    let meta = m.groupMetadata;
    if (!meta || typeof meta !== "object") {
      meta = await sock.groupMetadata(m.chat).catch(() => ({}));
    }

    const name = meta.subject || "Grup WhatsApp";
    const owner = meta.owner ? `@${meta.owner.split("@")[0]}` : "Tidak Diketahui";
    const created = meta.creation
      ? new Date(meta.creation * 1000).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })
      : "-";

    const participants = participantsOf(m) || meta.participants || [];
    const totalMembers = participants.length || 0;
    const adminCount = participants.filter((p) => p.admin).length || 0;
    const desc = meta.desc || meta.description || "Tidak ada deskripsi grup.";

    const text =
      alyaHeader("Group Info & Intro", "🏰") +
      "\n\n" +
      bracketBox("🏰", "ɪɴꜰᴏ ɢʀᴜᴘ", [
        `◦ Nama: *${name}*`,
        `◦ ID: *${m.chat}*`,
        `◦ Pembuat/Owner: *${owner}*`,
        `◦ Dibuat pada: *${created}*`,
        `◦ Total Member: *${totalMembers}*`,
        `◦ Total Admin: *${adminCount}*`,
        `◦ Deskripsi: *${desc.slice(0, 150)}${desc.length > 150 ? "..." : ""}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk melihat menu lengkap`);

    await m.reply(text, {
      mentions: meta.owner ? [meta.owner] : [],
    });
  } catch (err) {
    await m.reply(`❌ Gagal mengambil info grup: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
