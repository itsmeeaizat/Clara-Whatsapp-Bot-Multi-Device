/**
 * Quote Image — popcat.xyz
 * Membuat gambar quote dengan foto profil & teks.
 * Usage: .popquote text
 */

import { popcatImage } from "../../src/lib/clara-popcat.js";

const pluginConfig = {
  name: "popquote",
  alias: ["quoteimg"],
  category: "maker",
  description: "Buat gambar quote dengan foto profil (maks 125 karakter)",
  usage: ".popquote <teks>",
  example: ".popquote Hidup itu seperti ngoding",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args?.join(" ") || "";
  if (!text) {
    return m.reply(`Teksnya mana?\nContoh: ${m.prefix || "."}popquote Hidup itu seperti ngoding`);
  }
  if (text.length > 125) {
    return m.reply("Teks terlalu panjang! Maksimal 125 karakter.");
  }

  try {
    // Dapatkan foto profil & nama pengirim (atau yang di-reply/mention)
    let targetJid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    let imageUrl = "";
    try {
      imageUrl = await sock.profilePictureUrl(targetJid, "image");
    } catch {
      // fallback: default avatar
      imageUrl = "https://telegra.ph/file/c5170017e92f837e28d5f.jpg";
    }

    // Nama author dari pushName atau nomor
    let authorName = "Clara User";
    try {
      authorName = m.mentionedJid?.[0]
        ? (await sock.getName(m.mentionedJid[0])) || "Clara User"
        : m.pushName || "Clara User";
    } catch {
      // keep default
    }

    const buf = await popcatImage("quote", {
      image: imageUrl,
      text,
      name: authorName,
    });
    await sock.sendMessage(m.chat, { image: buf, caption: `💬 "${text}"` }, { quoted: m });
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
