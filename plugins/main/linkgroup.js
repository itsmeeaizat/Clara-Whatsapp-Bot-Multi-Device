import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "linkgroup",
  alias: ["link", "linkgrup", "grouplink", "invitelink"],
  category: "group",
  description: "Dapatkan link grup",
  usage: ".linkgroup",
  example: ".linkgroup",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const chat = m.chat;

    let inviteCode = null;
    try {
      const result = await sock.groupInviteCode(chat);
      inviteCode = result;
    } catch {}

    const link = inviteCode
      ? `https://chat.whatsapp.com/${inviteCode}`
      : "https://chat.whatsapp.com/xxxxx";

    const text =
      alyaHeader("Link Group", "🔗") +
      "\n\n" +
      bracketBox("🔗", "ɪɴꜰᴏ", [
        `◦ Group: *${m.chatName || chat}*`,
        `◦ Link: *${link}*`,
        "◦ Status: *Active*",
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
