/**
 * Clara Menu Style — Clean & Modern
 * ---------------------------------------------------------------
 * Redesigned: minimal emoji, clean lines, professional look.
 * Bot yang serius gak butuh emoji di setiap baris.
 */

// Keep small caps untuk subtle styling
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

// ===================== HEADER =====================
// Clean header — no emoji, just bold title with line separator

function alyaHeader(title, emoji = "") {
  const safe = toSmallCaps(title);
  // Skip emoji jika kosong, tampilkan clean
  const prefix = emoji ? `${emoji} ` : "";
  return [
    `${prefix}*${safe}*`,
    `───────────────────`,
  ].join("\n");
}

// ===================== BRACKET BOX =====================
// Minimal box — no emoji in header, clean lines

function bracketBox(emoji, label, lines = []) {
  // emoji parameter optional — kalau kosong, skip
  const labelStr = typeof emoji === "string" && emoji.length <= 2 && emoji.match(/[\p{Emoji}]/u)
    ? `${emoji} ${toSmallCaps(label)}`
    : toSmallCaps(emoji); // emoji is actually the label, no emoji used
  // Support both signatures:
  // bracketBox("📋", "Info", [...])  -> with emoji
  // bracketBox("Info", [...])        -> no emoji (emoji=label, label=lines)
  let actualLabel, actualLines;
  if (Array.isArray(label)) {
    actualLabel = emoji; // first arg is label
    actualLines = label;
  } else {
    actualLabel = labelStr;
    actualLines = lines;
  }
  const header = `┌─ *${actualLabel}*`;
  const body = (actualLines || []).map((line) => `│ ${line}`);
  const footer = `└──────────`;
  return [header, ...body, footer].join("\n");
}

// ===================== INFO BLOCK =====================

function infoBlock(items = [], boxLabel = "Info", boxEmoji = "") {
  const lines = items.map(([label, value]) => {
    const val = typeof value === "undefined" || value === null ? "-" : value;
    return `  ${label}  ·  *${val}*`;
  });
  return bracketBox(boxEmoji, boxLabel, lines);
}

// ===================== USER INFO =====================

function userInfoBlock(pushName, username, status, role = "user") {
  return bracketBox("", "Profile", [
    `  Name  ·  *${pushName || "Guest"}*`,
    `  User  ·  *@${username || "unknown"}*`,
    `  Status  ·  *${status || "active"}*`,
    `  Role  ·  *${role}*`,
  ]);
}

// ===================== CATEGORY =====================

function categoryBlock(category, emoji, commands = [], prefix = ".") {
  const items = commands.map((cmd, i) => {
    const aliases = Array.isArray(cmd.alias) && cmd.alias.length
      ? ` (${cmd.alias.slice(0, 2).join(", ")})`
      : "";
    const name = typeof cmd === "string" ? cmd : cmd.name;
    return `  ${i + 1}. ${prefix}${name}${aliases}`;
  });
  return bracketBox(emoji, category, items);
}

// ===================== SEPARATOR =====================

function separator(char = "─", repeat = 19) {
  return `${char.repeat(repeat)}`;
}

// ===================== TIP TEXT =====================
// Clean tip — no emoji

function tipText(text) {
  return `_> ${text}_`;
}

// ===================== CATEGORY ROW =====================
// Clean row — no emoji unless provided

function alyaCategoryRow(emoji, name, description) {
  const e = emoji && emoji !== "📁" ? `${emoji} ` : "";
  return `*${toSmallCaps(name)}* — ${e}${description}`;
}

// ===================== MONO BOLD =====================

function toMonoUpperBold(text = "") {
  const chars = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛",
    I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣",
    Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫",
    Y: "𝗬", Z: "𝗭",
  };
  return String(text || "").toUpperCase().split("").map((c) => chars[c] || c).join("");
}

// ===================== BOX TITLE (legacy compat) =====================

function boxTitle(title, emoji = "") {
  const safe = toSmallCaps(title);
  const prefix = emoji ? `${emoji} ` : "";
  return [
    `${prefix}*${safe}*`,
    `───────────────────`,
  ].join("\n");
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
