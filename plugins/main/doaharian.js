// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "doaharian",
  alias: ["doaharian", "doa", "doaacak", "doarandom"],
  category: "religi",
  description: "Kumpulan doa harian (108 doa)",
  usage: ".doaharian <nomor> | .doaharian list | .doaharian acak",
  example: ".doaharian acak",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const input = m.text?.trim()?.toLowerCase() || "acak";

    if (input === "list") {
      const res = await axios.get("https://api.myquran.com/v2/doa/semua", { timeout: 10000 });
      const doaList = res.data?.data || [];
      const list = doaList.slice(0, 15).map((d, i) =>
        `${i + 1}. ${d.judul || "Doa"}`
      ).join("\n");

      const text = alyaHeader("Doa Harian", "🤲") + "\n\n" +
        bracketBox("🤲", "ᴅᴀꜰᴛᴀʀ ᴅᴏᴀ", [
          `◦ Total: *${doaList.length} doa*`,
          "◦ Menampilkan: *15 pertama*",
        ]) + "\n\n" + list + "\n\n" + separator() + "\n" +
        tipText(`Ketik ${prefix}doaharian <nomor> untuk baca doa`);
      await m.reply(text);
      return { handled: true };
    }

    let doa;
    if (input === "acak" || input === "random" || !input) {
      const res = await axios.get("https://api.myquran.com/v2/doa/acak", { timeout: 10000 });
      doa = res.data?.data;
    } else {
      const nomor = parseInt(input);
      if (isNaN(nomor)) throw new Error("Format: .doaharian <nomor|list|acak>");
      const res = await axios.get(`https://api.myquran.com/v2/doa/${nomor}`, { timeout: 10000 });
      doa = res.data?.data;
    }

    if (!doa) throw new Error("Doa tidak ditemukan");

    const text = alyaHeader("Doa Harian", "🤲") + "\n\n" +
      bracketBox("🤲", "ᴅᴏᴀ", [
        `◦ Judul: *${doa.judul || "-"}*`,
      ]) + "\n\n" +
      `◦ Arab: *${doa.doa}*\n` +
      `◦ Latin: *${doa.latin || "-"}*\n` +
      `◦ Arti: *${doa.artinya || "-"}*\n` +
      `◦ Sumber: *${doa.source || "-"}*` +
      "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}doaharian acak untuk doa lain`);

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
