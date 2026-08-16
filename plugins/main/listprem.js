import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "listprem",
  alias: ["listprem", "listpremium", "premlist", "premiumlist"],
  category: "owner",
  description: "Lihat daftar user premium",
  usage: ".listprem",
  example: ".listprem",
  isOwner: true,
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
    const db = getDatabase();
    const users = db.getAllUsers();
    const prem = Object.entries(users)
      .filter(([, u]) => u?.premium === true)
      .map(([jid, u]) => u?.name || jid);

    const lines = prem.length
      ? prem.map((name, i) => `${i + 1}. ${name}`)
      : ["◦ Belum ada user premium."];

    const text =
      alyaHeader("List Premium", "👑") +
      "\n\n" +
      bracketBox("👑", "ᴘʀᴇᴍɪᴜᴍ", lines) +
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
