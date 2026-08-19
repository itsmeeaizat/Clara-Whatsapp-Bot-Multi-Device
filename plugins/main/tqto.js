// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * TQTO — Thanks To
 * ---------------------------------------------------------------
 * Credits untuk pembuat bot.
 */

const TQTO_IMAGE = "https://telegra.ph/file/5478e28cc3ace94df0d43.jpg";

const TQTO_CAPTION = `*Thanks To :*

- Aizat

*Modular Version:*
Aizat`;

const pluginConfig = {
  name: "tqto",
  alias: ["tqto"],
  category: "main",
  description: "Menampilkan daftar thanks to / contributor bot",
  usage: ".tqto",
  example: ".tqto",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await sock.sendMessage(
      m.chat,
      {
        image: { url: TQTO_IMAGE },
        caption: TQTO_CAPTION,
      },
      { quoted: m }
    );
  } catch (err) {
    // Fallback: kirim teks saja jika gambar gagal
    await m.reply(TQTO_CAPTION);
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
