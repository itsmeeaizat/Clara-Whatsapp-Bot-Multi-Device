import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const NIAT_SHOLAT = {
  subuh: { arab: "اُصُلِّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ لِلَّهِ تَعَالَى", latin: "Ushollii fardhosh-shubhi rak'ataini mustaqbilal qiblati lillaahi ta'aalaa", arti: "Niat sholat Subuh 2 rakaat menghadap kiblat karena Allah Ta'ala" },
  dzuhur: { arab: "اُصُلِّى فَرْضَ الظُّهْرِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ لِلَّهِ تَعَالَى", latin: "Ushollii fardhodz-dzuhri arba'a rakaataatin mustaqbilal qiblati lillaahi ta'aalaa", arti: "Niat sholat Dzuhur 4 rakaat menghadap kiblat karena Allah Ta'ala" },
  ashar: { arab: "اُصُلِّى فَرْضَ الْعَصْرِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ لِلَّهِ تَعَالَى", latin: "Ushollii fardhol-'ashri arba'a rakaataatin mustaqbilal qiblati lillaahi ta'aalaa", arti: "Niat sholat Ashar 4 rakaat menghadap kiblat karena Allah Ta'ala" },
  maghrib: { arab: "اُصُلِّى فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ لِلَّهِ تَعَالَى", latin: "Ushollii fardhol-maghribi tsalaatsa rakaataatin mustaqbilal qiblati lillaahi ta'aalaa", arti: "Niat sholat Maghrib 3 rakaat menghadap kiblat karena Allah Ta'ala" },
  isya: { arab: "اُصُلِّى فَرْضَ الْعِشَاءِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ لِلَّهِ تَعَالَى", latin: "Ushollii fardhol-'ishaa-i arba'a rakaataatin mustaqbilal qiblati lillaahi ta'aalaa", arti: "Niat sholat Isya 4 rakaat menghadap kiblat karena Allah Ta'ala" },
};

const pluginConfig = {
  name: "niatsalat",
  alias: ["niatsalat", "niatsholat", "niatshalat", "niatsolat"],
  category: "religi",
  description: "Lihat niat sholat 5 waktu",
  usage: ".niatsalat <subuh|dzuhur|ashar|maghrib|isya>",
  example: ".niatsalat subuh",
  isOwner: false, isPremium: false, isGroup: true, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const input = m.text?.trim()?.toLowerCase();

    if (!input) {
      const list = Object.keys(NIAT_SHOLAT).map(k =>
        `◦ *${k}* - ${NIAT_SHOLAT[k].arti}`
      ).join("\n");

      const text = alyaHeader("Niat Sholat", "🕌") + "\n\n" +
        bracketBox("🕌", "ᴅᴀꜰᴛᴀʀ", [
          "◦ Pilih: subuh, dzuhur, ashar, maghrib, isya",
        ]) + "\n\n" + list + "\n\n" + separator() + "\n" +
        tipText(`Ketik ${prefix}niatsalat <waktu> untuk lihat niat`);
      await m.reply(text);
      return { handled: true };
    }

    const niats = NIAT_SHOLAT[input];
    if (!niats) throw new Error(`Pilihan tidak valid. Tersedia: ${Object.keys(NIAT_SHOLAT).join(", ")}`);

    const text = alyaHeader("Niat Sholat", "🕌") + "\n\n" +
      bracketBox("🕌", "ɴɪᴀᴛ ꜱʜᴏʟᴀᴛ", [
        `◦ Waktu: *${input}*`,
      ]) + "\n\n" +
      `◦ Arab: *${niats.arab}*\n` +
      `◦ Latin: *${niats.latin}*\n` +
      `◦ Arti: *${niats.arti}*` +
      "\n\n" + separator() + "\n" +
      tipText(`Ketik ${prefix}niatsalat <waktu> untuk niat lain`);

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
