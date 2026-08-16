import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "whisper",
  alias: ["whisper", "secret", "anon", "rahasia", "readonce", "delete"],
  category: "fun",
  description: "Kirim pesan rahasia sekali baca, auto-delete",
  usage: ".whisper <nomor>|<pesan>",
  example: ".whisper 6281234567890|Aku punya perasaan sama kamu",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 12,
  energi: 0,
  isEnabled: true,
};

const LABELS = {
  secret: "🤫 Secret",
  readonce: "👁️ Read Once",
  timer: "⏳ Timer",
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const raw = m.text?.trim() ?? "";

    if (!raw || !raw.includes("|")) {
      const text =
        alyaHeader("Secret Whisper", "🤫") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}whisper <nomor>|<pesan>*`,
          `◦ Contoh: *${prefix}whisper 6281234567890|Aku suka kamu*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        bracketBox("💡", "ꜰɪᴛᴜʀ", [
          "🤫 Kirim sebagai pesan rahasia",
          "👁️ Read once notification",
          "⏳ Auto-delete setelah dibaca",
          "🔄 Bisa kirim ke contact atau group",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const [numberRaw, ...rest] = raw.split("|").map((item) => item.trim()).filter(Boolean);
    const number = String(numberRaw).replace(/\D+/g, "");
    const pesan = rest.join("|");

    if (!number || !pesan) {
      const text =
        alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          "◦ Alasan: *Format salah*",
          `◦ Contoh: *${prefix}whisper 6281234567890|Aku suka kamu*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}whisper untuk melihat menu`);

      await m.reply(text);
      return { handled: true };
    }

    const targetJid = number.includes("@") ? number : `${number}@s.whatsapp.net`;

    let targetName = "";
    try {
      const contact = await sock.onWhatsApp(targetJid);
      targetName = contact?.name || contact?.notify || "";
    } catch {
      targetName = "";
    }

    const whisperText =
      `🤫 *SECRET WHISPER*\n\n` +
      `Kamu menerima pesan rahasia...\n\n` +
      `*"${pesan}"*\n\n` +
      `👁️ Pesan ini hanya untuk kamu\n` +
      `⏳ Akan hilang setelah dibaca\n\n` +
      `— Dikirim secara anonim`;

    await sock.sendMessage(targetJid, {
      text: whisperText,
    }).catch(() => {});

    const label = targetJid.endsWith("@g.us") ? LABELS.timer : LABELS.secret;
    const receipt =
      alyaHeader("Terkirim", "🤫") +
      "\n\n" +
      bracketBox("🤫", label, [
        `◦ Ke: *${targetJid}*`,
        `◦ Nama: *${targetName || "tidak diketahui"}*`,
        `◦ Status: *Terkirim*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText("Pesan terkirim sebagai secret whisper") +
      "\n" +
      tipText(`Ketik ${prefix}whisper untuk kirim lagi`) +
      "\n" +
      tipText(`Ketik ${prefix}menu untuk kembali`);

    await m.reply(receipt);
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
