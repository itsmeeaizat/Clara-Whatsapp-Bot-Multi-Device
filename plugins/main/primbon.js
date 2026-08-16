import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "primbon",
  alias: ["primbon", "artinama", "artimimpi", "nomorhoki", "zodiak"],
  category: "religi",
  description: "Cek primbon (arti nama, arti mimpi, nomor hoki, zodiak)",
  usage: ".artinama <nama> | .artimimpi <mimpi> | .nomorhoki <nomor> | .zodiak <zodiak>",
  example: ".artinama Budi",
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
    const text = m.text?.trim();

    if (!text) {
      const reply =
        alyaHeader("Cara Pakai", "🔮") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ .artinama <nama> - Arti nama`,
          `◦ .artimimpi <mimpi> - Arti mimpi`,
          `◦ .nomorhoki <nomor> - Cek nomor hoki`,
          `◦ .zodiak <zodiak> - Ramalan zodiak`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(reply);
      return { handled: true };
    }

    const primbon = await import("@bochilteam/scraper-primbon");
    const cmd = m.body?.split(" ")[0]?.replace(prefix, "").toLowerCase() || "primbon";
    const input = text;

    let result = null;
    let title = "Primbon";

    if (cmd === "artinama" || cmd === "primbon") {
      result = await primbon.artinama(input);
      title = "Arti Nama";
    } else if (cmd === "artimimpi") {
      result = await primbon.artimimpi(input);
      title = "Arti Mimpi";
    } else if (cmd === "nomorhoki") {
      result = await primbon.nomorhoki(input);
      title = "Nomor Hoki";
    } else if (cmd === "zodiak") {
      result = await primbon.getZodiac(input);
      title = "Zodiak";
    } else {
      result = await primbon.artinama(input);
      title = "Arti Nama";
    }

    const reply =
      alyaHeader(title, "🔮") +
      "\n\n" +
      bracketBox("🔮", title.toUpperCase(), [
        `◦ Input: *${input}*`,
        `◦ Hasil: *${result || "Tidak ditemukan"}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}primbon untuk cek lagi`);

    await m.reply(reply);
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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
