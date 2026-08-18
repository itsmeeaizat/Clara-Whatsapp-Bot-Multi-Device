import util from "util";

const pluginConfig = {
  name: "exec2",
  alias: ["exec2", "execnode"],
  category: "owner",
  description: "Jalankan kode JavaScript / Node.js",
  usage: ".exec2 <code>",
  example: ".exec2 console.log('hello')",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, extra) {
  try {
    const code = (m.text || "").trim();
    if (!code) {
      return m.reply("❌ Masukkan kode JavaScript yang ingin dieksekusi!\nUsage: .exec2 <code>");
    }

    const { sock, config, db } = extra;
    let evaled;
    try {
      evaled = await eval(`(async () => { ${code} })()`);
    } catch (e) {
      evaled = e;
    }

    let output;
    if (typeof evaled !== "string") {
      output = util.inspect(evaled, { depth: 2 });
    } else {
      output = evaled;
    }

    await m.reply("⚡ *NODE.JS EVAL OUTPUT*\n\n```javascript\n" + output + "\n```");
  } catch (err) {
    await m.reply(`❌ ${String(err.message).slice(0, 100)}`);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
