// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import { getPlayer, addGold, savePlayer } from "../../src/lib/clara-rpg-service.js";

const pluginConfig = {
  name: "buy",
  alias: ["beli", "purchase", "buy"],
  category: "economy",
  description: "Beli item dari shop",
  usage: ".buy <item>",
  example: ".buy Potion",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const ITEMS = {
  potion: { name: "Potion", price: 50 },
  sword: { name: "Sword", price: 200 },
  shield: { name: "Shield", price: 150 },
  armor: { name: "Armor", price: 300 },
  ring: { name: "Ring", price: 500 },
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const input = (m.text || "").trim().toLowerCase();
    const itemKey = input.split(/[ \n]+/)[0];

    if (!itemKey) {
      const text =
        alyaHeader("Cara Pakai", "🛒") +
        "\n\n" +
        bracketBox("📋", "ɪɴꜰᴏ", [
          `◦ Penggunaan: *${prefix}buy <item>*`,
          `◦ Contoh: *${prefix}buy Potion*`,
          `◦ Shop: *${prefix}shop*`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const item = ITEMS[itemKey];
    if (!item) {
      const text =
        alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          "◦ Status: *Item tidak ditemukan*",
          `◦ Daftar: ${Object.keys(ITEMS).join(", ")}`,
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}shop untuk melihat daftar`) +
        "\n" +
        tipText(`Ketik ${prefix}menu untuk kembali`);

      await m.reply(text);
      return { handled: true };
    }

    const player = getPlayer(m);
    const gold = player?.gold || 0;

    if (gold < item.price) {
      const text =
        alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [
          `◦ Item: *${item.name}*`,
          `◦ Harga: *${item.price} Gold*`,
          `◦ Saldo: *${gold} Gold*`,
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

    const inventory = player?.inventory || {};
    const currentCount = inventory[item.name] || 0;

    addGold(m, -item.price);

    savePlayer(m, {
      inventory: {
        ...inventory,
        [item.name]: currentCount + 1,
      },
    });

    const updatedPlayer = getPlayer(m);

    const text =
      alyaHeader("Buy", "🛒") +
      "\n\n" +
      bracketBox("🛒", "ʜᴀꜱɪʟ", [
        `◦ Item: *${item.name}*`,
        `◦ Harga: *${item.price} Gold*`,
        `◦ Sisa Gold: *${updatedPlayer?.gold || 0} Gold*`,
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
