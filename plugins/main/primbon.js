import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "primbon",
  alias: ["primbon", "sunda", "jawa", "ramalan"],
  category: "religi",
  description: "Cek primbon Jawa/Sunda",
  usage: ".primbon <nama> <tanggal>",
  example: ".primbon Ahmad 2000-01-01",
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
    const args = m.text?.trim().split(/\s+/);

    if (args.length < 2) {
      const text =
        alyaHeader("Cara Pakai", "🔮") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}primbon <nama> <tanggal>*`,
          `◦ Contoh: *${prefix}primbon Ahmad 2000-01-01*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const name = args[0];
    const date = args.slice(1).join(" ");

    let ramalan = "Akan sukses di masa depan";
    try {
      const apiUrl = `https://api.zeks.xyz/api/primbon?nama=${encodeURIComponent(name)}&tgl=${encodeURIComponent(date)}`;
      const res = await fetch(apiUrl);
      const json = await res.json();
      ramalan = json.result || json.ramalan || ramalan;
    } catch {}

    const text =
      alyaHeader("Primbon", "🔮") +
      "\n\n" +
      bracketBox("🔮", "ʜᴀꜱɪʟ", [
        `◦ Nama: *${name}*`,
        `◦ Tanggal: *${date}*`,
        `◦ Ramalan: *${ramalan}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}primbon <nama> <tanggal> untuk cek primbon lain`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali ke menu utama`);

    await m.reply(text);
  } catch (error) {
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
