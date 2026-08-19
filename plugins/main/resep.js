// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const pluginConfig = {
  name: "resep",
  alias: ["resep", "recipe", "resepmasakan", "masakan"],
  category: "search",
  description: "Cari resep masakan",
  usage: ".resep <nama masakan>",
  example: ".resep nasi lemak",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 10, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const query = m.text?.trim();
    if (!query) {
      const text = alyaHeader("Cara Pakai", "🍳") + "\n\n" + bracketBox("📋", "ɪɴꜰᴏ", [
        `◦ Penggunaan: *${prefix}resep <nama masakan>*`,
        `◦ Contoh: *${prefix}resep nasi lemak*`,
      ]) + "\n\n" + separator() + "\n" + tipText(`Ketik ${prefix}menu untuk kembali`);
      await m.reply(text);
      return { handled: true };
    }

    const res = await axios.get("https://www.themealdb.com/api/json/v1/1/search.php", {
      params: { s: query }, timeout: 10000,
    });

    const meals = res.data?.meals;
    if (!meals?.length) throw new Error("Resep tidak ditemukan");

    const meal = meals[0];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) ingredients.push(`${ing} - ${measure || ""}`);
    }

    const instructions = meal.strInstructions?.substring(0, 800) || "-";

    // Send meal image
    if (meal.strMealThumb) {
      try {
        const imgRes = await axios.get(meal.strMealThumb, { responseType: "arraybuffer", timeout: 10000 });
        await sock.sendMessage(m.chat, {
          image: Buffer.from(imgRes.data),
          caption: `🍳 *${meal.strMeal}*\n◦ Asal: *${meal.strArea || "-"}*`,
        }, { quoted: m });
      } catch {}
    }

    const text = alyaHeader("Resep", "🍳") + "\n\n" +
      bracketBox("🍳", "ʀᴇꜱᴇᴘ ᴍᴀꜱᴀᴋᴀɴ", [
        `◦ Nama: *${meal.strMeal}*`,
        `◦ Asal: *${meal.strArea || "-"}*`,
        `◦ Kategori: *${meal.strCategory || "-"}*`,
      ]) + "\n\n" +
      "*Bahan:*\n" + ingredients.map((i, n) => `${n + 1}. ${i}`).join("\n") +
      "\n\n*Cara Membuat:*\n" + instructions +
      "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}resep <nama> untuk resep lain`);

    await m.reply(text);
  } catch (error) {
    const prefix = botConfig.command?.prefix || ".";
    const text = alyaHeader("Gagal", "❌") + "\n\n" + bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`, `◦ Alasan: *${error.message}*`,
    ]) + "\n\n" + separator() + "\n" + tipText(`Coba lagi nanti`);
    await m.reply(text);
  }
  return { handled: true };
}

export default { config: pluginConfig, handler };
