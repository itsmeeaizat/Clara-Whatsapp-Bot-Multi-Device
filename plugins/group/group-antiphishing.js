/**
 * Anti Phishing — Deteksi & blokir link phishing/scam berbahaya
 * .antiphishing on/off — Toggle (admin grup)
 * .antiphishing status — Cek status
 * .antiphishing whitelist <domain> — Whitelist domain aman
 * .antiphishing unwhitelist <domain> — Hapus dari whitelist
 *
 * Deteksi: link shortener (bit.ly, tinyurl, dll), domain mencurigakan,
 * link dengan IP mentah, domain typosquatting, link dengan @ symbol,
 * dan link dari database phishing known.
 */
import config from "../../config.js";
import { getDatabase } from "../../src/lib/clara-database.js";

// Known phishing/scam domains
const PHISHING_DOMAINS = [
  "bit.ly", "tinyurl.com", "shorte.st", "adf.ly", "bc.vc", "soo.gd",
  "cutt.ly", "shorturl.at", "t.ly", "rb.gy", "is.gd", "v.gd",
  "ow.ly", "buff.ly", "rebrand.ly", "tiny.cc", "snip.ly",
  "su.pr", "twurl.nl", "lnkd.in", "db.tt", "qr.ae", "po.st",
];

// Suspicious TLDs often used for phishing
const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".icu", ".click", ".country", ".stream", ".download", ".xin", ".gdn", ".bid", ".loan", ".win", ".men", ".work", ".date", ".review", ".party", ".trade", ".science", ".racing", ".accountant", ".cricket", ".faith", ".place", ".rip", ".rocks", ".kim", ".wang"];

// Safe domains whitelist
const SAFE_DOMAINS = new Set([
  "google.com", "youtube.com", "github.com", "facebook.com", "instagram.com",
  "twitter.com", "whatsapp.com", "telegram.org", "wikipedia.org",
  "shopee.co.id", "tokopedia.com", "lazada.co.id", "bukalapak.com",
  "gojek.com", "grab.com", "tokopedia.com", "bca.co.id", "mandiri.co.id",
  "bni.co.id", "bri.co.id", "ovo.id", "dana.id", "gopay.id",
]);

// Group states
const groupStates = new Map();

function getGroupState(jid) {
  if (!groupStates.has(jid)) {
    groupStates.set(jid, { enabled: true, blocked: 0, whitelist: new Set() });
  }
  return groupStates.get(jid);
}

function extractUrls(text) {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}(\/[^\s]*)?)/gi;
  return text.match(urlRegex) || [];
}

function extractDomain(url) {
  try {
    const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const domain = clean.split("/")[0].split("?")[0].split("#")[0];
    return domain.toLowerCase();
  } catch { return ""; }
}

function detectPhishing(url, whitelist) {
  const domain = extractDomain(url);
  if (!domain) return { isPhishing: false };

  // Cek whitelist
  if (whitelist.has(domain) || SAFE_DOMAINS.has(domain)) return { isPhishing: false };

  // Cek IP mentah (http://192.168.1.1/...)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
    return { isPhishing: true, reason: "Link menggunakan IP mentah (berbahaya)" };
  }

  // Cek domain phishing known
  if (PHISHING_DOMAINS.includes(domain)) {
    return { isPhishing: true, reason: "Domain shortener/phishing terkenal: " + domain };
  }

  // Cek TLD mencurigakan
  for (const tld of SUSPICIOUS_TLDS) {
    if (domain.endsWith(tld)) {
      return { isPhishing: true, reason: "TLD mencurigakan: *" + tld };
    }
  }

  // Cek @ symbol di URL (user:pass@domain — phishing trick)
  if (url.includes("@") && !url.startsWith("https://") && !url.startsWith("http://")) {
    return { isPhishing: true, reason: "URL mengandung karakter @ (trik phishing)" };
  }

  // Cek subdomain berlebihan (phishing panjang)
  const parts = domain.split(".");
  if (parts.length > 4) {
    return { isPhishing: true, reason: "Subdomain berlebihan (mencurigakan)" };
  }

  // Cek domain dengan karakter aneh (hex/unicode)
  if (/\\x[0-9a-f]{2}/i.test(url) || /%[0-9a-f]{2}/i.test(url)) {
    return { isPhishing: true, reason: "URL mengandung encoded characters" };
  }

  return { isPhishing: false };
}

async function handler(m, { sock, db, groupMetadata }) {
  const command = m.command;
  const args = (m.text || "").toLowerCase().trim();
  const isGroup = m.chat?.endsWith("@g.us");

  if (command === "antiphishing") {
    if (!isGroup) return m.reply("Hanya untuk grup!");

    const meta = groupMetadata || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return m.reply("Gagal mendapatkan info grup.");
    const isAdmin = meta.participants?.some(p => p.id === m.sender && (p.admin === "admin" || p.admin === "superadmin"));
    const isOwner = config.owner?.numbers?.some(n => m.sender === n + "@s.whatsapp.net") || false;
    if (!isAdmin && !isOwner) return m.reply("Admin/Owner only!");

    const state = getGroupState(m.chat);
    const sub = args.split(" ")[0];
    const val = args.split(" ")[1];

    if (sub === "on" || sub === "enable") {
      state.enabled = true;
      const dbInst = getDatabase();
      if (dbInst?.setGroup) dbInst.setGroup(m.chat, { antiphishing: true });
      return m.reply("Anti Phishing aktif! Bot akan deteksi & hapus link phishing otomatis.");
    }
    if (sub === "off" || sub === "disable") {
      state.enabled = false;
      const dbInst = getDatabase();
      if (dbInst?.setGroup) dbInst.setGroup(m.chat, { antiphishing: false });
      return m.reply("Anti Phishing dinonaktifkan.");
    }
    if (sub === "whitelist") {
      if (!val) return m.reply("Format: .antiphishing whitelist <domain>\nContoh: .antiphishing whitelist toko-saya.com");
      state.whitelist.add(val);
      return m.reply("Domain " + val + " ditambahkan ke whitelist (aman).");
    }
    if (sub === "unwhitelist") {
      if (!val) return m.reply("Format: .antiphishing unwhitelist <domain>");
      state.whitelist.delete(val);
      return m.reply("Domain " + val + " dihapus dari whitelist.");
    }
    if (sub === "status") {
      let wl = Array.from(state.whitelist);
      if (wl.length > 5) wl = wl.slice(0, 5).join(", ") + " (+" + (wl.length - 5) + " lainnya)";
      else wl = wl.join(", ") || "kosong";
      return m.reply("Anti Phishing: " + (state.enabled ? "ON" : "OFF") + "\nBlocked: " + state.blocked + " link\nWhitelist: " + wl);
    }

    return m.reply("Anti Phishing: " + (state.enabled ? "ON" : "OFF") + "\n\n.antiphishing on/off — Toggle\n.antiphishing status — Cek\n.antiphishing whitelist <domain> — Whitelist\n.antiphishing unwhitelist <domain> — Hapus whitelist");
  }

  return { handled: false };
}

// Export untuk message handler
export function checkPhishing(text, jid) {
  const state = groupStates.get(jid);
  if (!state || !state.enabled) return { isPhishing: false };
  const urls = extractUrls(text);
  for (const url of urls) {
    const result = detectPhishing(url, state.whitelist);
    if (result.isPhishing) {
      state.blocked++;
      return { isPhishing: true, url, reason: result.reason };
    }
  }
  return { isPhishing: false };
}

export function isAntiPhishingEnabled(jid) {
  const state = groupStates.get(jid);
  return state ? state.enabled : false;
}

const pluginConfig = {
  name: "antiphishing",
  alias: ["antiphishing", "antiscam", "antipishing"],
  category: "group",
  description: "Anti phishing & scam link — deteksi link berbahaya dengan whitelist",
  usage: ".antiphishing on/off/status | .antiphishing whitelist <domain>",
  isOwner: false,
  isGroup: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

export default { config: pluginConfig, handler };
