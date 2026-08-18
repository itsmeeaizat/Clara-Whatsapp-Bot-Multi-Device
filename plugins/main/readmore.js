/**
 * Read More / Spoiler / Hide Text
 * ---------------------------------------------------------------
 * Sisipkan karakter zero-width untuk membuat teks tersembunyi
 * yang baru muncul setelah user klik "Read more".
 *
 * Cara pakai: .readmore teks1|teks2
 */

const MORE_CHAR = String.fromCharCode(8206);
const READ_MORE = MORE_CHAR.repeat(4001);

const pluginConfig = {
  name: "readmore",
  alias: ["readmore", "hidetext", "spoiler", "selengkapnya"],
  category: "main",
  description: "Sembunyikan teks di balik read more. .readmore terlihat|tersembunyi",
  usage: ".readmore <teks1>|<teks2>",
  example: ".readmore Halo|Ini tersembunyi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const text = m.text || "";

  if (!text) {
    await m.reply(`❌ Gunakan format:\n.readmore teks1|teks2\n\n*Contoh:*\n.readmore Halo|Ini tersembunyi`);
    return { handled: true };
  }

  const [left, right] = text.split("|");

  const result = `${left || ""}${READ_MORE}${right || ""}`;

  await m.reply(result);
  return { handled: true };
}

export default { config: pluginConfig, handler };
