// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
// CLARA STYLE SYSTEM — CLEAN EDITION
// Gaya minimal, rapi, mudah di-maintain
// ============================================================

const STYLE = {
  botName: "Clara-AI",
  ownerName: "Owner",
  prefix: ".",
  boxWidth: 22,
  theme: "clean",
  emojis: {
    header: "🪞",
    menu: "📋",
    info: "ℹ️",
    download: "⬇️",
    search: "🔍",
    ai: "✨",
    user: "👤",
    bot: "🤖",
    music: "🎧",
    video: "🎬",
    success: "✅",
    error: "❌",
    warning: "⚠️",
    tip: "💡",
    loading: "⏳",
    play: "▶️",
    heart: "🤍",
    star: "⭐",
    youtube: "▶️",
    tiktok: "🎵",
    spotify: "🎧",
    soundcloud: "☁️",
    instagram: "📸",
    facebook: "📘",
    twitter: "🐦",
    wallpaper: "🖼️",
    sticker: "🖼️",
    upscale: "🔍",
    anime: "🍥",
    game: "🎯",
    economy: "💰",
    premium: "💎",
    panel: "🖥️",
    vps: "🌐",
  },
  labels: {
    title: "Title",
    artist: "Artist",
    duration: "Duration",
    size: "Size",
    quality: "Quality",
    format: "Format",
    author: "Author",
    channel: "Channel",
    views: "Views",
    likes: "Likes",
    description: "Description",
    status: "Status",
    version: "Version",
    role: "Role",
    id: "ID",
    name: "Name",
    resolution: "Resolution",
    bitrate: "Bitrate",
    album: "Album",
    year: "Year",
    genre: "Genre",
    lyrics: "Lyrics",
    cover: "Cover",
    thumbnail: "Thumbnail",
    source: "Source",
    date: "Date",
    time: "Time",
    uptime: "Uptime",
    mode: "Mode",
    server: "Server",
    location: "Location",
    provider: "Provider",
    speed: "Speed",
    latency: "Latency",
    battery: "Battery",
    storage: "Storage",
    ram: "RAM",
    cpu: "CPU",
  },
  greetings: {
    pagi: "Selamat pagi",
    siang: "Selamat siang",
    sore: "Selamat sore",
    malam: "Selamat malam",
  },
  tips: {
    menu: "Ketik {prefix}menu untuk kembali ke menu utama",
    daftar: "Ketik {prefix}daftar untuk melihat daftar kategori",
    allmenu: "Ketik {prefix}allmenu untuk semua command",
    play: "Ketik {prefix}play <judul> untuk mencari lagu lain",
    yt: "Ketik {prefix}yt <link> untuk download video lain",
    tiktok: "Ketik {prefix}tiktok <link> untuk download video TikTok",
    ai: "Ketik {prefix}ai <pertanyaan> untuk bertanya lagi",
    help: "Ketik {prefix}help untuk bantuan",
  },
  separators: {
    thin: "┈",
    thick: "━",
    double: "═",
    dot: "·",
    star: "✧",
  },
};

// ============================================================
// UTILITIES
// ============================================================

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

function toMonoUpperBold(text = "") {
  const chars = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛",
    I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣",
    Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫",
    Y: "𝗬", Z: "𝗭",
  };
  return String(text || "").toUpperCase().split("").map((c) => chars[c] || c).join("");
}

function formatNumber(num) {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return STYLE.greetings.pagi;
  if (hour >= 10 && hour < 14) return STYLE.greetings.siang;
  if (hour >= 14 && hour < 18) return STYLE.greetings.sore;
  return STYLE.greetings.malam;
}

function getEmoji(key) {
  return STYLE.emojis[key] || "";
}

function getLabel(key) {
  return STYLE.labels[key] || key;
}

function getTip(key, prefix = STYLE.prefix) {
  const template = STYLE.tips[key] || "";
  return template.replace(/\{prefix\}/g, prefix);
}

// ============================================================
// BRACKET BOX BUILDERS
// ============================================================

function separator(type = "thick", repeat = STYLE.boxWidth) {
  const char = STYLE.separators[type] || STYLE.separators.thick;
  return `*${char.repeat(repeat)}*`;
}

function tipText(text) {
  return `💡 *ᴛɪᴘ:* ${text}`;
}

function boxTitle(title, emoji = "📦") {
  const safe = toSmallCaps(title);
  return [
    `╔══════════════════╗`,
    `   ${emoji} *${safe}*`,
    `╚══════════════════╝`,
  ].join("\n");
}

function headerBar(title, emoji = STYLE.emojis.header) {
  const safe = toSmallCaps(title);
  return `┌──〔 ${emoji} *${safe}* 〕──┐\n│ ◦ Menu terbaru & update fitur\n└────────────────────────────`;
}

function bracketBox(emoji, label, lines = []) {
  const header = `╭┈┈⬡「 ${emoji} *${toSmallCaps(label)}* 」`;
  const body = lines.map((line) => `┃ ${line}`);
  const footer = `╰┈┈⬡`;
  return [header, ...body, footer].join("\n");
}

function infoBlock(title, lines = []) {
  if (Array.isArray(lines) && lines.length && Array.isArray(lines[0])) {
    const mapped = lines.map(([label, value]) => {
      const val = typeof value === "undefined" || value === null ? "tidak diketahui" : value;
      return `◦ ${label}: *${val}*`;
    });
    return bracketBox(getEmoji("info"), title, mapped);
  }
  return bracketBox(getEmoji("info"), title, lines);
}

function previewBlock(title, items = []) {
  const lines = items.map(([label, value]) => {
    const val = typeof value === "undefined" || value === null ? "tidak diketahui" : value;
    return `◦ ${label}: *${val}*`;
  });
  return bracketBox(getEmoji("info"), title, lines);
}

function userInfoBlock(name, id, role = "user") {
  const roleTag = role === "owner" ? getEmoji("premium") : role === "premium" ? "💎" : getEmoji("user");
  return bracketBox(roleTag, toSmallCaps("pʀᴏꜰɪʟ"), [
    `◦ Name: *${name || "Guest"}*`,
    `◦ ID: *${id || "unknown"}*`,
    `◦ Role: *${role}*`,
  ]);
}

function botInfoBlock(name, version = "1.0", status = "Online") {
  return bracketBox(getEmoji("bot"), toSmallCaps("ʙᴏᴛ"), [
    `◦ Name: *${name || STYLE.botName}*`,
    `◦ Version: *${version}*`,
    `◦ Status: *${status}*`,
  ]);
}

function resultBlock(title, items = [], prefix = STYLE.prefix) {
  const header = `╭┈┈⬡「 📦 *${toSmallCaps(title)}* 」`;
  const body = items.map((item, i) => {
    if (typeof item === "string") {
      return `┃ ${i + 1}. ${prefix}${item}`;
    }
    const name = item.name || item.command || "unknown";
    const alias = Array.isArray(item.alias) && item.alias.length ? ` (${item.alias.slice(0, 2).join(", ")})` : "";
    return `┃ ${i + 1}. ${prefix}${name}${alias}`;
  });
  const footer = `╰┈┈⬡`;
  return [header, ...body, footer].join("\n");
}

function downloadBlock(title, items = []) {
  const lines = items.map((item, i) => {
    if (typeof item === "string") return `${i + 1}. ${item}`;
    const parts = [];
    if (item.quality) parts.push(`Quality: ${item.quality}`);
    if (item.format) parts.push(`Format: ${item.format}`);
    if (item.size) parts.push(`Size: ${item.size}`);
    if (item.label) parts.push(item.label);
    return `${i + 1}. ${parts.join(" | ") || "Unknown"}`;
  });
  return bracketBox(getEmoji("download"), title, lines);
}

function aiChatBlock(role, text) {
  const prefix = role === "user" ? getEmoji("user") : getEmoji("bot");
  const label = role === "user" ? "kamu" : "bot";
  return `${prefix} *${toSmallCaps(label)}:* ${text}`;
}

function chatBubble(role, text) {
  const prefix = role === "user" ? getEmoji("user") : getEmoji("bot");
  return `${prefix} ${text}`;
}

function greetingBlock(customText = "") {
  const timeGreeting = getTimeGreeting();
  const text = customText || `${timeGreeting}! Ada yang bisa aku bantu?`;
  return `💬 *${toSmallCaps("sapaan")}*\n┃ ◦ ${text}`;
}

function smartGreeting(userName = "") {
  const timeGreeting = getTimeGreeting();
  const namePart = userName ? `, ${userName}` : "";
  return `💬 *${toSmallCaps("sapaan")}*\n┃ ◦ ${timeGreeting}${namePart}! Ada yang bisa aku bantu?`;
}

function categoryRow(emoji, name, description) {
  return `${emoji} *${toSmallCaps(name)}*\n  ◦ ${description}`;
}

// ============================================================
// THEME / CONFIG HELPERS
// ============================================================

function updateStyle(partial) {
  Object.assign(STYLE, partial);
}

function resetStyle() {
  Object.keys(STYLE).forEach((key) => delete STYLE[key]);
}

export {
  STYLE,
  updateStyle,
  resetStyle,
  // utilities
  toSmallCaps,
  toMonoUpperBold,
  formatNumber,
  getTimeGreeting,
  getEmoji,
  getLabel,
  getTip,
  // builders
  separator,
  tipText,
  boxTitle,
  headerBar,
  bracketBox,
  infoBlock,
  previewBlock,
  userInfoBlock,
  botInfoBlock,
  resultBlock,
  downloadBlock,
  aiChatBlock,
  chatBubble,
  greetingBlock,
  smartGreeting,
  categoryRow,
};
