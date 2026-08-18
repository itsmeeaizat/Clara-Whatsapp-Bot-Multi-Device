const pluginConfig = {
  name: "simulate",
  alias: ["simulate"],
  category: "owner",
  description: "Simulasikan perintah bot",
  usage: ".simulate <cmd>",
  example: ".simulate .ping",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config, db, uptime }) {
  try {
    const simCmd = (m.text || "").trim();
    if (!simCmd) {
      return m.reply("❌ Masukkan perintah yang ingin disimulasikan!\nUsage: .simulate <cmd>");
    }

    const prefix = config?.command?.prefix || ".";
    const body = simCmd.startsWith(prefix) ? simCmd : prefix + simCmd;
    const commandName = body.slice(prefix.length).split(/\s+/)[0].toLowerCase();
    const argsText = body.slice(prefix.length + commandName.length).trim();

    const fakeM = {
      ...m,
      body: body,
      command: commandName,
      text: argsText,
    };

    const { handleCommand } = await import("../../src/handler.js");
    const handled = await handleCommand(fakeM, sock, config, db, uptime);

    if (handled) {
      await m.reply(`✅ *Simulasi Selesai!* Perintah \`${body}\` berhasil dieksekusi.`);
    } else {
      await m.reply(`ℹ️ Perintah \`${body}\` tidak ditemukan atau tidak menghasilkan respon.`);
    }
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
