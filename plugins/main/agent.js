import { alyaHeader, bracketBox, separator, tipText } from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "agent",
  alias: ["agent", "agents", "subagent", "assistant"],
  category: "owner",
  description: "Kelola agent/sub-agent",
  usage: ".agent <perintah>",
  example: ".agent list",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";

    const text =
      alyaHeader("Agent", "🤖") +
      "\n\n" +
      bracketBox("🤖", "ᴀɢᴇɴᴛ", [
        "◦ Fitur agent aktif.",
        "◦ Gunakan perintah yang valid.",
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
