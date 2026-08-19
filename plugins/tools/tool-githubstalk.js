// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * GitHub Stalk
 * Lihat info profil GitHub.
 * Usage: .githubstalk <username>
 */

const pluginConfig = {
  name: "githubstalk",
  alias: ["ghstalk", "github"],
  category: "tools",
  description: "Stalk profil GitHub seseorang",
  usage: ".githubstalk <username>",
  example: ".githubstalk torvalds",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const username = m.args?.[0]?.replace("https://github.com/", "").replace("@", "");
  if (!username) {
    return m.reply(`Username-nya mana?\nContoh: ${m.prefix || "."}githubstalk torvalds`);
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) {
      if (res.status === 404) return m.reply("❌ User GitHub tidak ditemukan.");
      throw new Error(`HTTP ${res.status}`);
    }

    const d = await res.json();

    let txt = `*📊 GitHub Stalk*\n`;
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `👤 *Username:* ${d.login || "-"}\n`;
    txt += `📝 *Name:* ${d.name || "-"}\n`;
    txt += `📄 *Bio:* ${d.bio || "-"}\n`;
    txt += `🏢 *Company:* ${d.company || "-"}\n`;
    txt += `📍 *Location:* ${d.location || "-"}\n`;
    txt += `🔗 *Blog:* ${d.blog || "-"}\n`;
    txt += `🐦 *Twitter:* ${d.twitter_username || "-"}\n`;
    txt += `📧 *Email:* ${d.email || "-"}\n`;
    txt += `📦 *Public Repos:* ${d.public_repos || 0}\n`;
    txt += `📌 *Public Gists:* ${d.public_gists || 0}\n`;
    txt += `👥 *Followers:* ${d.followers || 0}\n`;
    txt += `👥 *Following:* ${d.following || 0}\n`;
    txt += `📅 *Created:* ${d.created_at ? new Date(d.created_at).toLocaleDateString("id-ID") : "-"}\n`;
    txt += `🔄 *Updated:* ${d.updated_at ? new Date(d.updated_at).toLocaleDateString("id-ID") : "-"}\n`;
    txt += `🌐 *URL:* ${d.html_url || "-"}`;

    // Kirim dengan avatar
    if (d.avatar_url && sock) {
      try {
        const imgRes = await fetch(d.avatar_url);
        const buf = Buffer.from(await imgRes.arrayBuffer());
        await sock.sendMessage(m.chat, { image: buf, caption: txt }, { quoted: m });
      } catch {
        await m.reply(txt);
      }
    } else {
      await m.reply(txt);
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
