// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import fs from "fs";
import path from "path";
import config from "../../config.js";

function resolveAsset(key, fallbackPath) {
  const mapped = config.assets?.[key];
  const candidates = [mapped, fallbackPath].filter(Boolean);
  for (const p of candidates) {
    if (path.isAbsolute(p) && fs.existsSync(p)) return p;
    if (!path.isAbsolute(p)) {
      const abs = path.resolve(process.cwd(), p);
      if (fs.existsSync(abs)) return abs;
    }
  }
  return null;
}

function getWelcomeThumbnail() {
  return resolveAsset("clara-welcome", "./assets/image/clara-welcome.jpg");
}

function getGoodbyeThumbnail() {
  return resolveAsset("clara-goodbye", "./assets/image/clara-goodbye.jpg");
}

function getGroupThumbnail() {
  return resolveAsset("clara", "./assets/image/clara.png");
}

async function prepareThumbnail(sock, preferredPath) {
  const imagePath = preferredPath || getGroupThumbnail();
  if (!imagePath || !fs.existsSync(imagePath)) return null;

  try {
    const { prepareWAMessageMedia } = await import("clara");
    const buffer = fs.readFileSync(imagePath);
    const media = await prepareWAMessageMedia(
      { image: buffer },
      { upload: sock.waUploadToServer }
    );
    return media.imageMessage || null;
  } catch {
    return null;
  }
}

// --- Sync thumbnail buffer cache ---
// Cache buffer thumbnail di memory, baca sekali, dipakai berkali-kali
const _thumbCache = {};

function getThumbnailBuffer(preferredPath) {
  const imagePath = preferredPath || getGroupThumbnail();
  if (!imagePath) return null;

  // Return dari cache kalau sudah ada
  if (_thumbCache[imagePath]) return _thumbCache[imagePath];

  try {
    if (!fs.existsSync(imagePath)) return null;
    const buf = fs.readFileSync(imagePath);
    _thumbCache[imagePath] = buf;
    return buf;
  } catch {
    return null;
  }
}

function getWelcomeThumbBuffer() {
  return getThumbnailBuffer(getWelcomeThumbnail());
}

function getGoodbyeThumbBuffer() {
  return getThumbnailBuffer(getGoodbyeThumbnail());
}

function clearThumbCache() {
  for (const k of Object.keys(_thumbCache)) {
    delete _thumbCache[k];
  }
}

export {
  getWelcomeThumbnail,
  getGoodbyeThumbnail,
  getGroupThumbnail,
  prepareThumbnail,
  getThumbnailBuffer,
  getWelcomeThumbBuffer,
  getGoodbyeThumbBuffer,
  clearThumbCache,
};
