import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "wink",
  alias: ["wink", "kedip", "fly", "fly2"],
  category: "fun",
  description: "Kirim wink ke target",
  usage: ".wink <@target>",
  example: ".wink @username",
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
    const raw = m.text?.trim() || "";
    const target = raw.replace(/^\.wink\s+/i, "").trim();

    if (!target) {
      const text =
        alyaHeader("Cara Pakai", "😉") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}wink <@target>*`,
          `◦ Contoh: *${prefix}wink @username*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    const targetName = target.replace(/^@+/, "");
    const senderName = m.pushName || "Kamu";

    db.push("winks", {
      from: m.sender,
      to: target,
      createdAt: Date.now(),
    });

    const text =
      alyaHeader("Wink", "😉") +
      "\n\n" +
      bracketBox("😉", "ᴡɪɴᴋ", [
        `◦ Kamu mengirim wink ke *${targetName}*`,
        "◦ Status: *Berhasil*",
      ]) +
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
