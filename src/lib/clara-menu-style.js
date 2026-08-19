// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const SMALL_CAPS = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
  i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
  q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
  y: "ʏ", z: "ᴢ",
};

function toSmallCaps(text = "") {
  return String(text)
    .toLowerCase()
    .split("")
    .map((c) => SMALL_CAPS[c] || c)
    .join("");
}

function formatNumber(num) {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function boxTitle(title, emoji = "📦") {
  const safe = toSmallCaps(title);
  return [
    `╭─· ${emoji} *${safe}*`,
    `╰──────────────·`,
  ].join("\n");
}

function alyaHeader(title, emoji = "🤖") {
  const safe = toSmallCaps(title);
  return [
    `✧　${emoji} *${safe}* 　✧`,
    `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
  ].join("\n");
}

function bracketBox(emoji, label, lines = []) {
  const header = `╭─ ${emoji} *${toSmallCaps(label)}*`;
  const body = lines.map((line) => `│  ${line}`);
  const footer = `╰─ · · ·`;
  return [header, ...body, footer].join("\n");
}

function infoBlock(items = [], boxLabel = "ɪɴꜰᴏ", boxEmoji = "📊") {
  const lines = items.map(([label, value]) => {
    const val = typeof value === "undefined" || value === null ? "tidak diketahui" : value;
    return `✿ ${label}  ·  *${val}*`;
  });
  return bracketBox(boxEmoji, boxLabel, lines);
}

function userInfoBlock(pushName, username, status, role = "user") {
  const roleTag = role === "owner" ? "👑" : role === "premium" ? "💎" : "🎀";
  return bracketBox(roleTag, toSmallCaps("pʀᴏꜰɪʟ"), [
    `✿ Name  ·  *${pushName || "Guest"}*`,
    `✿ User  ·  *@${username || "unknown"}*`,
    `✿ Status  ·  *${status || "active"}*`,
    `✿ Role  ·  *${role}*`,
  ]);
}

function categoryBlock(category, emoji, commands = [], prefix = ".") {
  const items = commands.map((cmd, i) => {
    const aliases = Array.isArray(cmd.alias) && cmd.alias.length
      ? ` (${cmd.alias.slice(0, 2).join(", ")})`
      : "";
    const name = typeof cmd === "string" ? cmd : cmd.name;
    return `${i + 1}. ${prefix}${name}${aliases}`;
  });
  return bracketBox(emoji, category, items);
}

function separator(char = "┄", repeat = 18) {
  return `*${char.repeat(repeat)}*`;
}

function tipText(text) {
  return `🎀 *ᴛɪᴘ:* ${text}`;
}

function alyaCategoryRow(emoji, name, description) {
  return `${emoji} *${toSmallCaps(name)}*\n   ✿ ${description}`;
}

function toMonoUpperBold(text = "") {
  const chars = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛",
    I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣",
    Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫",
    Y: "𝗬", Z: "𝗭",
  };
  return String(text || "").toUpperCase().split("").map((c) => chars[c] || c).join("");
}

export {
  toMonoUpperBold,
  toSmallCaps,
  formatNumber,
  boxTitle,
  alyaHeader,
  bracketBox,
  infoBlock,
  userInfoBlock,
  categoryBlock,
  separator,
  tipText,
  alyaCategoryRow,
};
