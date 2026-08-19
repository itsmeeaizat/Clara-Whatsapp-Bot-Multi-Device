// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { popcatImage } from "../../src/lib/clara-popcat.js";
import { uploadImage } from "../../src/lib/clara-uploader.js";

const pluginConfig = {
  name: "gun",
  alias: ["gungun"],
  category: "maker",
  description: "Tambahkan efek pistol ke gambar atau foto profil",
  usage: ".gun",
  example: ".gun @user (atau reply gambar)",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    let imageUrl = "";

    // Check if quoted message or current message has an image
    if (m.quoted && (m.quoted.isImage || m.hasQuotedImage) && typeof m.quoted.download === "function") {
      const imgBuffer = await m.quoted.download();
      if (imgBuffer && imgBuffer.length > 0) {
        imageUrl = await uploadImage(imgBuffer);
      }
    } else if (m.isImage && typeof m.download === "function") {
      const imgBuffer = await m.download();
      if (imgBuffer && imgBuffer.length > 0) {
        imageUrl = await uploadImage(imgBuffer);
      }
    }

    // If no uploaded image, get profile picture of mentioned user, quoted sender, or message sender
    if (!imageUrl) {
      let targetJid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
      if (targetJid) {
        try {
          imageUrl = await sock.profilePictureUrl(targetJid, "image");
        } catch {
          imageUrl = "";
        }
      }
    }

    if (!imageUrl) {
      await m.reply("Gagal mendapatkan gambar atau foto profil target. Pastikan target memiliki foto profil atau reply pesan gambar.");
      return { handled: true };
    }

    const buf = await popcatImage("gun", { image: imageUrl });
    await sock.sendMessage(m.chat, { image: buf, caption: "Gun 🔫" }, { quoted: m });
  } catch (error) {
    await m.reply(`Gagal memproses gambar gun: ${error.message}`);
  }
  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
