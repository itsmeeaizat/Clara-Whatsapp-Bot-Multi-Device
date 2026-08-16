import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "topchart",
  alias: ["topchart", "topchartid", "chartmusik", "topsongs"],
  category: "music",
  description: "Top chart lagu terpopuler (Indonesia)",
  usage: ".topchart",
  example: ".topchart",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const res = await axios.get("https://rss.applemarketingtools.com/api/v2/id/music/most-played/10/songs.json", { timeout: 10000 });

    const songs = res.data?.feed?.results;
    if (!songs?.length) throw new Error("Gagal mengambil chart");

    const list = songs.map((s, i) =>
      `${i + 1}. *${s.name}*\n   Artist: ${s.artistName}`
    ).join("\n\n");

    const text = alyaHeader("Top Chart", "🏆") + "\n\n" +
      bracketBox("🏆", "ᴛᴏᴘ ᴄʜᴀʀᴛ ɪᴅ", [
        "◦ Negara: *Indonesia*",
        `◦ Total: *${songs.length} lagu*`,
      ]) + "\n\n" + list + "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}previewmusik <judul> untuk preview`) + "\n" +
      tipText(`Ketik ${prefix}play <judul> untuk download`);

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
