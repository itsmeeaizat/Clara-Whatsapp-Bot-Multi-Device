// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  smartGreeting,
  getEmoji,
  getTip,
  toSmallCaps,
  STYLE,
} from "./clara-style.js";

const BOX = STYLE.boxWidth || 22;

function separator(char = "─", repeat = BOX) {
  return `*${char.repeat(repeat)}*`;
}

function curveTop(width = BOX) {
  const half = Math.floor(width / 2);
  return `╭${"─".repeat(half)}✧${"─".repeat(width - half - 1)}╮`;
}

function curveBottom(width = BOX) {
  const half = Math.floor(width / 2);
  return `╰${"─".repeat(half)}✧${"─".repeat(width - half - 1)}╯`;
}

function bracketHeader(emoji, label) {
  return `╭┈┈⬡「 ${emoji} *${toSmallCaps(label)}* 」`;
}

function bracketFooter() {
  return `╰┈┈⬡`;
}

function infoRow(emoji, label, value) {
  const safe = typeof value === "undefined" || value === null ? "tidak diketahui" : value;
  return `${emoji} ${toSmallCaps(label)} : *${safe}*`;
}

function userInfoPanel({
  name = "Guest",
  username = "-",
  id = "unknown",
  role = "user",
  prefix = STYLE.prefix || ".",
}) {
  const roleEmoji = role === "owner" ? "👑" : role === "premium" ? "💎" : "👤";
  const header = bracketHeader("👤", "pʀᴏꜰɪʟ");
  const body = [
    infoRow("💬", "ɴᴀᴍᴇ", name),
    infoRow("👤", "ᴜsᴇʀɴᴀᴍᴇ", username ? `@${username}` : "-"),
    infoRow("🆔", "ɪᴅ", id),
    infoRow("🎖️", "ʀᴏʟᴇ", role),
    infoRow("💬", "ᴘʀᴇꜰɪx", prefix),
  ].map((line) => `┃ ${line}`).join("\n");
  const footer = bracketFooter();
  return [header, body, footer].join("\n");
}

function botInfoPanel({
  name = STYLE.botName || "Clara-AI",
  version = "1.0",
  mode = "PUBLIC",
  uptime = "-",
  totalCommands = 0,
}) {
  const header = bracketHeader("🤖", "ʙᴏᴛ");
  const body = [
    infoRow("🤖", "ɴᴀᴍᴇ", name),
    infoRow("📦", "ᴠᴇʀsɪ", version),
    infoRow("🌐", "ᴍᴏᴅᴇ", mode),
    infoRow("⏱️", "ᴜᴘᴛɪᴍᴇ", uptime),
    infoRow("📌", "ᴄᴍᴅ", `${totalCommands} perintah`),
  ].map((line) => `┃ ${line}`).join("\n");
  const footer = bracketFooter();
  return [header, body, footer].join("\n");
}

function systemInfoPanel({
  server = "-",
  location = "-",
  speed = "-",
  storage = "-",
  ram = "-",
}) {
  const header = bracketHeader("🖥️", "sʏsᴛᴇᴍ");
  const body = [
    infoRow("🌐", "sᴇʀᴠᴇʀ", server),
    infoRow("📍", "ʟᴏᴄᴀᴛɪᴏɴ", location),
    infoRow("⚡", "sᴘᴇᴇᴅ", speed),
    infoRow("💾", "sᴛᴏʀᴀɢᴇ", storage),
    infoRow("🧠", "ʀᴀᴍ", ram),
  ].map((line) => `┃ ${line}`).join("\n");
  const footer = bracketFooter();
  return [header, body, footer].join("\n");
}

function categoryBlock(emoji, title, commands = [], prefix = STYLE.prefix || ".") {
  const safe = toSmallCaps(title);
  const header = `┌── ${emoji} *${safe}* ${"─".repeat(Math.max(0, BOX - safe.length - 6))}┐`;
  const body = commands
    .map((cmd) => {
      if (typeof cmd === "string") return `│ ${prefix}${cmd}`;
      const name = cmd.name || cmd.command || "unknown";
      const alias = Array.isArray(cmd.alias) && cmd.alias.length ? ` (${cmd.alias.slice(0, 2).join(", ")})` : "";
      const desc = cmd.description ? ` - ${cmd.description}` : "";
      return `│ ${prefix}${name}${alias}${desc}`;
    })
    .join("\n");
  const footer = `└${"─".repeat(BOX - 2)}┘`;
  return [header, body, footer].join("\n");
}

function menuFooter(prefix = STYLE.prefix || ".") {
  const tips = [
    getTip("menu", prefix),
    getTip("allmenu", prefix),
    getTip("help", prefix),
  ].filter(Boolean);

  const body = [
    `┃ ◦ ${toSmallCaps("ᴘᴏᴡᴇʀᴇᴅ ʙʏ")} *${STYLE.botName || "Clara-AI"}*`,
    "",
    ...tips.map((tip, i) => `┃ ${i + 1}. ${tip}`),
  ].join("\n");

  return [separator("━", BOX), "", curveTop(BOX), body, curveBottom(BOX)].join("\n");
}

function buildMenu({
  user = {},
  bot = {},
  system = {},
  categories = [],
  prefix = STYLE.prefix || ".",
}) {
  const timeGreeting = getTimeGreeting();
  const greeting = smartGreeting(user.name || "");

  const userPanel = userInfoPanel({
    name: user.name || "Guest",
    username: user.username || "-",
    id: user.id || "unknown",
    role: user.role || "user",
    prefix,
  });

  const botPanel = botInfoPanel({
    name: bot.name || STYLE.botName || "Clara-AI",
    version: bot.version || "1.0",
    mode: bot.mode || "PUBLIC",
    uptime: bot.uptime || "-",
    totalCommands: bot.totalCommands || 0,
  });

  const sysPanel = systemInfoPanel({
    server: system.server || "-",
    location: system.location || "-",
    speed: system.speed || "-",
    storage: system.storage || "-",
    ram: system.ram || "-",
  });

  const categorySections = categories
    .map((cat) => {
      const emoji = cat.emoji || "📁";
      const title = cat.name || cat.category || "OTHER";
      const cmds = (cat.commands || []).map((cmd) => {
        if (typeof cmd === "string") return cmd;
        return {
          name: cmd.name || cmd.command,
          alias: cmd.alias || [],
          description: cmd.description || "",
        };
      });
      return categoryBlock(emoji, title, cmds, prefix);
    })
    .join("\n\n");

  return [
    greeting,
    "",
    userPanel,
    "",
    botPanel,
    "",
    sysPanel,
    "",
    separator("━", BOX),
    "",
    categorySections,
    "",
    menuFooter(prefix),
  ].join("\n");
}

function buildCategoryMenu(selectedCategory, commands = [], prefix = STYLE.prefix || ".") {
  const safe = toSmallCaps(selectedCategory || "MENU");
  const title = selectedCategory ? `Menu ${selectedCategory}` : "Menu All";

  let txt = smartGreeting() + "\n\n";
  txt += `╭┈┈⬡「 📂 *${safe}* 」\n`;
  txt += commands
    .map((cmd, i) => {
      if (typeof cmd === "string") return `┃ ${i + 1}. ${prefix}${cmd}`;
      const name = cmd.name || cmd.command || "unknown";
      const alias = Array.isArray(cmd.alias) && cmd.alias.length ? ` (${cmd.alias.slice(0, 2).join(", ")})` : "";
      const desc = cmd.description ? ` - ${cmd.description}` : "";
      return `┃ ${i + 1}. ${prefix}${name}${alias}${desc}`;
    })
    .join("\n");
  txt += `\n╰┈┈⬡\n\n`;
  txt += separator("━", BOX) + "\n";
  txt += getTip("menu", prefix) + "\n";
  txt += getTip("allmenu", prefix);
  return txt;
}

export {
  buildMenu,
  buildCategoryMenu,
  userInfoPanel,
  botInfoPanel,
  systemInfoPanel,
  categoryBlock,
  menuFooter,
  curveTop,
  curveBottom,
  separator,
  bracketHeader,
  bracketFooter,
  infoRow,
};
