// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Clara Canvas Helper
 * Utility functions for canvas-based maker plugins.
 */

/**
 * Download profile picture dari WhatsApp.
 * Fallback ke default avatar jika gagal.
 */
const DEFAULT_AVATAR = "https://telegra.ph/file/24fa902ead26340f3df2c.png";

export async function downloadProfilePic(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return Buffer.from(await res.arrayBuffer());
  } catch {
    // Fallback: download default avatar
    try {
      const res = await fetch(DEFAULT_AVATAR);
      return Buffer.from(await res.arrayBuffer());
    } catch {
      // Last resort: generate a blank avatar
      return null;
    }
  }
}

/**
 * Get target JID from quoted message, mention, or sender.
 */
export function getTargetJid(m) {
  if (m.quoted) return m.quoted.sender;
  if (m.mentionedJid && m.mentionedJid[0]) return m.mentionedJid[0];
  return m.sender;
}

/**
 * Draw circular image on canvas context.
 */
export function drawCircularImage(ctx, image, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, x, y, size, size);
  ctx.restore();
}

/**
 * Word wrap text on canvas context.
 */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 10) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let lineCount = 0;

  for (const word of words) {
    const testLine = line ? line + " " + word : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines) return currentY;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}
