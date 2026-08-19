// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const pluginConfig = {
  name: "blocklist",
  alias: ["blocklist"],
  category: "owner",
  description: "Tampilkan daftar kontak yang diblokir",
  usage: ".blocklist",
  example: ".blocklist",
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
    const list = await sock.fetchBlocklist();
    if (!list || list.length === 0) {
      return m.reply("🚫 Tidak ada kontak yang diblokir.");
    }

    let txt = `🚫 *DAFTAR KONTAK DIBLOKIR* (${list.length})\n\n`;
    txt += list.map((v, i) => `${i + 1}. @${v.split("@")[0]}`).join("\n");

    await m.reply(txt, null, { mentions: list });
  } catch (err) {
    await m.reply(`❌ Gagal mengambil daftar blokir: ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
