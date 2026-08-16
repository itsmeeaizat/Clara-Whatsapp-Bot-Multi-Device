import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getDatabase } from "../../src/lib/clara-database.js";

const pluginConfig = {
  name: "antilink",
  alias: ["antilink", "antigc", "antigrup", "antilinkgc"],
  category: "group",
  description: "Anti link grup (admin only)",
  usage: ".antilink on/off",
  example: ".antilink on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|net|org|xyz|id|cc|me|co|link|web|site|tv|io|app|dev|biz|info|top|icu|fun|pro|tk|ml|ga|cf|gq|host|online|website|store|shop|blog|wordpress|github|gitlab|bitbucket|youtube|facebook|twitter|instagram|tiktok|telegram|whatsapp|line|discord|twitch|reddit|pinterest|snapchat|medium|behance|dribbble|soundcloud|spotify|netflix|google|bing|yahoo|duckduckgo|paypal|shopee|tokopedia|bukalapak|tiktokshop|zalora|lazada|blibli|traveloka|tiket|airbnb|booking|agoda|kayak|expedia|uber|grab|gojek|lyft|bolt|cabify|ola|didi|inDriver|taxi|maps|waze|googlemaps|applemaps|bingmaps|heremaps|openstreetmap|osm|wiki|wikipedia|wikimedia|merriam-webster|cambridge|oxford|britannica|investopedia|forbes|bloomberg|reuters|apnews|bbc|cnn|foxnews|nbc|cbs|abcnews|skynews|aljazeera|rt|dw|fr24|flightradar24|radarbox|adsbexchange|flightaware|flightstats|oag|seatguru|skyscanner|kayak|momondo|cheapflights|edreams|opodo|wego|trivago|hotels|trivago|booking|agoda|airbnb|hostelworld|couchsurfing|trustpilot|tripadvisor|yelp|foursquare|swarm|zomato|opentable|resy|grubhub|ubereats|doordash|postmates|caviar|deliveroo|justeat|takeaway|boltfood|grabfood|gojekfood|ninjavan|jne|pos|tiki|sicepat|anteraja|jnt|shopeexpress|lazadaexpress|ninjaxpress|gojekinstant|grabexpress|deliveree|paxel|lalamove|selfpick|biteship|anteraja|nusantara|rcti|sctv|trans7|metrotv|kompastv|indosiar|mnctv|globaltv|antv|gtv|tvone|news|detik|tempo|kompas|liputan6|coconuts|jakartapost|asiatimes|straitstimes|channelnewsasia|nhk|jiji|kyodo|afp|upi|anadolu|ansa|dpa|afp|ap|reuters|gettyimages|shutterstock|adobestock|istock|unsplash|pexels|pixabay|giphy|tenor|imgur|reddit|deviantart|artstation|behance|dribbble|figma|canva|photopea|removebg|clippingmagic|backgroundremover|tinypng|squoosh|imagecompressor|tinyjpg|optimizilla|ezgif|imgur|gyazo|lightshot|snipboard|prntscr|pasteboard|clipboard|paste|copypasta|spam|scam|phishing|malware|virus|trojan|ransomware|keylogger|spyware|adware|botnet|ddos|dos|flood|attack|hack|exploit|vulnerability|zero-day|0day|cve|security|breach|leak|dump|database|sqlinjection|xss|csrf|rce|ssrf|lfi|rfi|directorytraversal|fileinclusion|remotecode|codeexecution|privilegeescalation))/gi;

function containsLink(text = "") {
  return LINK_REGEX.test(text);
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = m.text?.trim().toLowerCase();

    if (!["on", "off"].includes(args)) {
      const text =
        alyaHeader("Cara Pakai", "⚠️") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}antilink on/off*`,
          `◦ Contoh: *${prefix}antilink on*`,
          `◦ Contoh: *${prefix}antilink off*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const db = getDatabase();
    db.setGroup(m.chat, { antilink: args === "on" });

    const text =
      alyaHeader("Antilink", "⚠️") +
      "\n\n" +
      bracketBox("⚠️", "ꜱᴛᴀᴛᴜꜱ", [
        "◦ Fitur: *Anti Link Group*",
        `◦ Status: *${args === "on" ? "ON" : "OFF"}*`,
        `◦ Group: *${m.chat}*`,
      ]) +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}antilink on/off untuk mengubah`) +
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

export { handler, pluginConfig, containsLink };
export default {
  config: pluginConfig,
  handler,
};
