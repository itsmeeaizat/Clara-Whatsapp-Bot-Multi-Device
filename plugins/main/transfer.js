// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, addGold, ensurePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "transfer",
  alias: ["tf", "kirim", "transfer", "sendgold"],
  category: "economy",
  description: "Kirim gold ke player lain",
  usage: ".transfer <jumlah> @member",
  example: ".transfer 100 @628xxxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function normalizeJid(target) {
  if (!target) return null;
  return String(target).replace(/@.+$/, "");
}

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const args = (m.text || "").trim().split(/[ \n]+/);
    const target = m.mentionedJid?.[0];

    if (!target) {
      const text =
        alyaHeader("Transfer", "💸") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}transfer <jumlah> @member*`,
          `◦ Contoh: *${prefix}transfer 100 @628xxxx*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const amount = parseInt(args[0], 10);
    if (!amount || amount <= 0) {
      const text =
        alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          "◦ Status: *Jumlah tidak valid*",
          `◦ Contoh: *${prefix}transfer 100 @member*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const sender = ensurePlayer(m, m.pushName || "Player");
    const senderJid = normalizeJid(m.sender);
    const receiverJid = normalizeJid(target);
    const receiver = ensurePlayer({ sender: receiverJid, pushName: "Penerima" }, "Penerima");

    if (senderJid === receiverJid) {
      const text =
        alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          "◦ Status: *Tidak bisa transfer ke diri sendiri*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const senderGold = sender?.gold || 0;

    if (senderGold < amount) {
      const text =
        alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          `◦ Saldo: *${senderGold} Gold*`,
          `◦ Jumlah: *${amount} Gold*`,
          "◦ Status: *Gold tidak cukup*",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}daily untuk klaim gold harian`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    addGold(m, -amount);
    addGold({ sender: receiverJid }, amount);

    const updatedSender = getPlayer(m);

    const text =
      alyaHeader("Transfer", "💸") +
      "\n\n" +
      bracketBox("💸", "ʜᴀꜱɪʟ", [
        `◦ Kirim: *${amount} Gold*`,
        `◦ Ke: *${receiver?.name || "Penerima"}*`,
        `◦ Sisa Gold: *${updatedSender?.gold || 0}*`,
        "◦ Status: *Berhasil*",
      ]) +
      "\n\n" +
      separator() +
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

export default {
  config: pluginConfig,
  handler,
};
