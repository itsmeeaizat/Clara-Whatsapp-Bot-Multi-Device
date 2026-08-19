// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import axios from "axios";
import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";

const KISAH_LIST = [
  { no: 1, judul: "Kisah Nabi Adam AS", desc: "Manusia pertama dan kisah kejatuhan" },
  { no: 2, judul: "Kisah Nabi Nuh AS", desc: "Bahtera dan banjir besar" },
  { no: 3, judul: "Kisah Nabi Ibrahim AS", desc: "Khalilullah, pembangunan Ka'bah" },
  { no: 4, judul: "Kisah Nabi Musa AS", desc: "Kisah Fir'aun dan Laut Merah" },
  { no: 5, judul: "Kisah Nabi Isa AS", desc: "Kelahiran dan mukjizat" },
  { no: 6, judul: "Kisah Nabi Muhammad SAW", desc: "Nabi terakhir, perjuangan dakwah" },
  { no: 7, judul: "Kisah Nabi Yusuf AS", desc: "Kisah kesabaran dan keindahan" },
  { no: 8, judul: "Kisah Nabi Sulaiman AS", desc: "Raja bijaksana dan kerajaan" },
  { no: 9, judul: "Kisah Nabi Daud AS", desc: "Raja dan pendengar firman Allah" },
  { no: 10, judul: "Kisah Umar bin Khattab", desc: "Amirul Mukminin yang adil" },
];

const KISAH_DETAIL = {
  1: "Nabi Adam AS adalah manusia pertama yang diciptakan Allah dari tanah. Ia diberi pengetahuan tentang nama-nama benda, melebihi malaikat. Bersama Hawa, mereka tinggal di surga, namun tergoda setan untuk memakan buah khuldi, sehingga diturunkan ke bumi. Adam AS bertaubat dan Allah menerima taubatnya.",
  2: "Nabi Nuh AS berdakwah selama 950 tahun, namun kaumnya tetap kafir. Allah memerintahkan membuat bahtera, lalu datang banjir besar yang menenggelamkan kaum kafir. Bahtera terselamatkan bersama pengikut setia dan hewan-hewan.",
  3: "Nabi Ibrahim AS digelar Khalilullah (kekasih Allah). Ia menghancurkan berhala kaumnya, dilempar ke api namun selamat. Bersama putranya Ismail, membangun Ka'bah di Makkah. Ia adalah bapak para Nani.",
  4: "Nabi Musa AS diutus kepada Fir'aun yang mengaku tuhan. Dengan mukjizat tongkat yang berubah ular, Musa menegakkan kebenaran. Saat dikejar, laut Merah belah menyelamatkan Bani Israil dan menenggelamkan Fir'aun.",
  5: "Nabi Isa AS lahir tanpa ayah dari Maryam. Ia diberi mukjizat menyembuhkan orang sakit dan menghidupkan orang mati dengan izin Allah. Ia diangkat ke langit dan akan kembali menjelang kiamat.",
  6: "Nabi Muhammad SAW lahir di Makkah, yatim sejak kecil. Menerima wahyu di Gua Hira. Berdakwah selama 23 tahun, menghadapi penindasan, hijrah ke Madinah, dan akhirnya menaklukkan Makkah. Wafat di Madinah pada usia 63 tahun.",
  7: "Nabi Yusuf AS dikenal paling tampan. Dijual saudaranya ke Mesir, difitnah, dipenjara, lalu naik menjadi menteri. Kisah penuh kesabaran dan ketabahan, dipertemukan kembali dengan keluarganya.",
  8: "Nabi Sulaiman AS putra Daud AS, mewarisi kerajaan dan kenabian. Diberi kemampuan berbicara dengan hewan dan jin. Membangun Baitul Maqdis. Kerajaannya paling makmur dalam sejarah.",
  9: "Nabi Daud AS raja dan nabi, diberi mukjizat besi menjadi lunak di tangannya. Ia penemu cara membuat baju besi. Zabur diturunkan kepadanya. Bijaksana dalam memutuskan perkara.",
  10: "Umar bin Khattab adalah sahabat Nabi yang terkenal tegas. Awalnya musuh Islam, lalu masuk Islam dan menjadi pembela setia. Menjadi khalifah kedua, memperluas wilayah Islam, terkenal dengan keadilan dan kemurahan hati.",
};

const pluginConfig = {
  name: "kisahislam",
  alias: ["kisahislam", "kisah", "kisahnabi", "kisahislami"],
  category: "religi",
  description: "Baca kisah islam (Nabi & Sahabat)",
  usage: ".kisahislam <nomor> | .kisahislam list",
  example: ".kisahislam 1",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  try {
    const prefix = botConfig.command?.prefix || ".";
    const input = m.text?.trim();

    if (!input || input.toLowerCase() === "list") {
      const list = KISAH_LIST.map(k =>
        `${k.no}. *${k.judul}*\n   ${k.desc}`
      ).join("\n\n");

      const text =
        alyaHeader("Kisah Islam", "📚") +
        "\n\n" +
        bracketBox("📚", "ᴅᴀꜰᴛᴀʀ ᴋɪꜱᴀʜ", [
          `◦ Total: *${KISAH_LIST.length} kisah*`,
        ]) +
        "\n\n" +
        list +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}kisahislam <nomor> untuk baca kisah`);

      await m.reply(text);
      return { handled: true };
    }

    const nomor = parseInt(input);
    if (isNaN(nomor) || nomor < 1 || nomor > KISAH_LIST.length) {
      throw new Error(`Nomor tidak valid (1-${KISAH_LIST.length})`);
    }

    const kisah = KISAH_LIST[nomor - 1];
    const detail = KISAH_DETAIL[nomor];

    const text =
      alyaHeader("Kisah Islam", "📚") +
      "\n\n" +
      bracketBox("📚", "ᴋɪꜱᴀʜ ɪꜱʟᴀᴍ", [
        `◦ Judul: *${kisah.judul}*`,
      ]) +
      "\n\n" +
      detail +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`Ketik ${prefix}kisahislam <nomor> untuk kisah lain`);

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
      tipText(`Coba lagi nanti`);

    await m.reply(text);
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
