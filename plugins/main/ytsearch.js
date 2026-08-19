// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "ytsearch",
  alias: ["ytsearch", "yts", "carivideo"],
  category: "music",
  description: "Cari video di YouTube",
  usage: ".ytsearch <query>",
  example: ".ytsearch cara membuat kue",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();
    if (!query) {
      const text = alyaHeader("Cara Pakai", "🔍") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}ytsearch <query>*`,
        `◦ Contoh: *${prefix}ytsearch cara membuat kue*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const yts = (await import("yt-search")).default;
    const results = await yts(query);
    const videos = (results.all || []).filter(v => v.type === "video").slice(0, 8);

    if (!videos.length) throw new Error("Tidak ada video ditemukan");

    const list = videos.map((v, i) =>
      `${i + 1}. *${v.title}*\n   ${v.url}\n   ${v.timestamp || ""} | ${v.author?.name || "-"}`
    ).join("\n\n");

    const text = alyaHeader("YouTube Search", "🔍") + "\n\n" +
      bracketBox("🔍", "ʜᴀꜱɪʟ", [
        `◦ Query: *${query}*`,
        `◦ Total: *${videos.length} video*`,
      ]) + "\n\n" + list + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}ytmp3 <link> untuk download audio`) + "\n" +
      tipText(`Ketik ${prefix}ytmp4 <link> untuk download video`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text = alyaHeader("Gagal", "❌") + "\n\n" + bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`, `◦ Alasan: *${error.message}*`,
    ]) + "\n\n" + separator() + "\n" + tipText(`Coba lagi nanti`);
    await m.reply(text);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
