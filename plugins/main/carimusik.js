import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "carimusik",
  alias: ["carimusik", "musicsearch", "itune", "itunessearch"],
  category: "search",
  description: "Cari musik di iTunes dengan preview",
  usage: ".carimusik <judul lagu>",
  example: ".carimusik adele hello",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();
    if (!query) {
      const text = alyaHeader("Cara Pakai", "🎶") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}carimusik <judul lagu>*`,
        `◦ Contoh: *${prefix}carimusik adele hello*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const res = await axios.get("https://itunes.apple.com/search", {
      params: { term: query, limit: 5, media: "music" }, timeout: 10000,
    });

    const results = res.data?.results;
    if (!results?.length) throw new Error("Musik tidak ditemukan");

    // Send first result's preview as audio
    const first = results[0];
    if (first.previewUrl) {
      try {
        const audioRes = await axios.get(first.previewUrl, { responseType: "arraybuffer", timeout: 15000 });
        await sock.sendMessage(m.chat, {
          audio: Buffer.from(audioRes.data),
          mimetype: "audio/mp4",
          ptt: false,
          fileName: `${first.trackName}.m4a`,
        }, { quoted: m });
      } catch {}
    }

    const list = results.map((r, i) =>
      `${i + 1}. *${r.trackName || "-"}*\n   Artist: ${r.artistName || "-"}\n   Album: ${r.collectionName || "-"}`
    ).join("\n\n");

    const text = alyaHeader("Cari Musik", "🎶") + "\n\n" +
      bracketBox("🎶", "ʜᴀꜱɪʟ", [
        `◦ Query: *${query}*`,
        `◦ Total: *${results.length} lagu*`,
      ]) + "\n\n" + list + "\n\n" + separator() + "\n" +
      tipText(`Preview audio dikirim di atas`) + "\n" +
      tipText(`Ketik ${prefix}carimusik <judul> untuk cari lagi`);

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
