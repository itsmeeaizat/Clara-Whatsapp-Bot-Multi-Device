// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "timecapsule",
  alias: ["timecapsule", "capsule", "future", "time", "terbuka", "ultah", "nanti"],
  category: "fun",
  description: "Buat pesan time capsule terbuka di masa depan",
  usage: ".timecapsule <hari>|<pesan>",
  example: ".timecapsule 7|Semoga grup ini terus rame",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const PRESETS = [
  "🍰 Ultah grup / anggota",
  "🎯 Capai goal bareng",
  "📅 Tahun baru grup",
  "💬 Reviewing momen lucu",
  "🏆 Keep track promises",
];

function buildMenu(prefix) {
  return (
    alyaHeader("Time Capsule", "🗝️") +
    "\n\n" +
    bracketBox("🗝️", "ɪɴꜰᴏ", [
      "◦ Fitur: *Time Capsule*",
      "◦ Konsep: *Pesan dikunci, terbuka nanti*",
      "◦ Cooldown: *10 detik*",
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    bracketBox("💡", "ᴘʀᴇꜱᴇᴛ ɪᴅᴇᴀ", PRESETS) +
    "\n\n" +
    separator() +
    "\n" +
    bracketBox("📋", "ᴘᴀᴋᴀɪ", [
      `◦ ${prefix}timecapsule <hari>|<pesan>`,
      `◦ Contoh: ${prefix}timecapsule 7|Semoga grup rame terus`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Pesan tidak dikirim otomatis; ini simulasi konsep dulu") +
    "\n" +
    tipText(`Ketik ${prefix}menu untuk kembali`)
  );
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = m.text?.trim() ?? "";

    if (!raw) {
      await m.reply(buildMenu(prefix));
      return { handled: true };
    }

    const parts = raw.split("|").map((item) => item.trim()).filter(Boolean);
    const days = Number(parts[0]);
    const message = parts.slice(1).join("|").trim();

    if (!Number.isInteger(days) || days <= 0 || !message) {
      const text =
        alyaHeader("Time Capsule", "🗝️") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          "◦ Alasan: *Format salah*",
          `◦ Contoh: ${prefix}timecapsule 7|Semoga grup rame terus`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}timecapsule untuk melihat menu`);

      await m.reply(text);
      return { handled: true };
    }

    const openDate = new Date();
    openDate.setDate(openDate.getDate() + days);

    const text =
      alyaHeader("Time Capsule", "🗝️") +
      "\n\n" +
      bracketBox("🗝️", "ꜱɪᴍᴘᴀɴ", [
        `◦ Durasi: *${days} hari*`,
        `◦ Terbuka: *${openDate.toLocaleDateString("id-ID")}*`,
        `◦ Pesan: *"${message}"*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Catatan: ini versi UI dulu, belum ada timer real") +
      "\n" +
      tipText(`Ketik ${prefix}timecapsule untuk buat lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

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
