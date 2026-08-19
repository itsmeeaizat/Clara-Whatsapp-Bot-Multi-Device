// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const pluginConfig = {
  name: "setbotpp",
  alias: ["setbotpp"],
  category: "owner",
  description: "Ganti foto profil bot (reply gambar)",
  usage: ".setbotpp (reply image)",
  example: ".setbotpp",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const q = m.quoted || m;
    const mime = q.mtype || q.mediaType || "";

    if (!/image/.test(mime) && !q.isImage) {
      return m.reply("❌ Reply atau kirim gambar dengan caption `.setbotpp`!");
    }

    let buffer;
    if (typeof q.download === "function") {
      buffer = await q.download();
    } else if (sock.downloadMediaMessage) {
      buffer = await sock.downloadMediaMessage(q);
    }

    if (!buffer) {
      return m.reply("❌ Gagal mengunduh gambar!");
    }

    const botJid = sock.user?.id || sock.user?.jid;
    await sock.updateProfilePicture(botJid, buffer);

    await m.reply("✅ Berhasil mengganti foto profil bot!");
  } catch (err) {
    await m.reply(`❌ Gagal mengganti pp bot: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
