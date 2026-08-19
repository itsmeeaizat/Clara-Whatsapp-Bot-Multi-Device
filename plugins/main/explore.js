// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Explore — menjelajah wilayah
 * ---------------------------------------------------------------
 * Sebelumnya PLACEHOLDER dengan hasil acak yang dibuang. Kini
 * tersambung ke clara-rpg-core: temuan benar-benar masuk ke koin,
 * exp, dan tas pemain.
 *
 *   .explore
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  simpanPemain,
  pakaiStamina,
  beriHadiah,
  tambahBarang,
  menitStaminaBerikutnya,
  STAMINA_MAKS,
  bar,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const BIAYA_STAMINA = 2;

/** Kejadian saat menjelajah, `bobot` menentukan peluang. */
const KEJADIAN = [
  {
    jenis: "harta",
    ikon: "💰",
    judul: "Peti Tersembunyi",
    cerita: "Kamu menemukan peti tua di balik semak.",
    koin: [200, 800],
    exp: [30, 70],
    bobot: 25,
  },
  {
    jenis: "harta",
    ikon: "🏺",
    judul: "Reruntuhan Kuno",
    cerita: "Sisa peradaban lama menyimpan barang berharga.",
    koin: [500, 1800],
    exp: [60, 130],
    bobot: 15,
  },
  {
    jenis: "barang",
    ikon: "🌿",
    judul: "Ladang Herbal",
    cerita: "Tumbuhan obat tumbuh subur di sini.",
    barang: "ramuan",
    jumlah: 2,
    exp: [20, 45],
    bobot: 20,
  },
  {
    jenis: "barang",
    ikon: "💎",
    judul: "Gua Kristal",
    cerita: "Dinding gua berkilau tertimpa cahaya.",
    barang: "kristal",
    jumlah: 1,
    exp: [50, 90],
    bobot: 10,
  },
  {
    jenis: "peti",
    ikon: "🎁",
    judul: "Peti Harta Karun",
    cerita: "Sebuah peti terkunci rapat menunggu dibuka.",
    exp: [40, 80],
    bobot: 8,
  },
  {
    jenis: "jebakan",
    ikon: "🕳️",
    judul: "Jebakan Lubang",
    cerita: "Kamu terperosok ke lubang berduri!",
    lukaPersen: [0.08, 0.2],
    bobot: 12,
  },
  {
    jenis: "kosong",
    ikon: "🍃",
    judul: "Jalan Buntu",
    cerita: "Tidak ada apa-apa selain angin dan dedaunan.",
    bobot: 10,
  },
];

function undiKejadian(acakFn = Math.random) {
  const total = KEJADIAN.reduce((a, b) => a + b.bobot, 0);
  let n = acakFn() * total;
  for (const k of KEJADIAN) {
    n -= k.bobot;
    if (n <= 0) return k;
  }
  return KEJADIAN[0];
}

function rentang([min, maks]) {
  return min + Math.floor(Math.random() * (maks - min + 1));
}

const pluginConfig = {
  name: "explore",
  alias: ["eksplor", "jelajah", "travel", "menjelajah"],
  category: "game",
  description: "Menjelajah wilayah untuk mencari harta dan barang langka",
  usage: ".explore",
  example: ".explore",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 25,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const p = ambilPemain(db, m.sender);

    if (p.hp <= 0) {
      await m.reply(
        alyaHeader("Kamu Tumbang", "💀") +
          "\n\n" +
          bracketBox("💀", "ᴋᴏɴᴅɪꜱɪ", [`◦ Pulihkan HP dengan *${prefix}ramuan*`]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Menjelajah butuh tenaga"),
      );
      return { handled: true };
    }

    if (p.stamina < BIAYA_STAMINA) {
      await m.reply(
        alyaHeader("Stamina Habis", "😮‍💨") +
          "\n\n" +
          bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
            `◦ Punya: *${p.stamina}/${STAMINA_MAKS}*`,
            `◦ Dibutuhkan: *${BIAYA_STAMINA}*`,
            `◦ Pulih +1 dalam *${menitStaminaBerikutnya(p)} menit*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Stamina pulih sendiri seiring waktu"),
      );
      return { handled: true };
    }

    pakaiStamina(db, m.sender, BIAYA_STAMINA);

    const k = undiKejadian();
    const bagian = [
      alyaHeader("Menjelajah", "🗺️"),
      "\n\n",
      bracketBox(k.ikon, "ᴋᴇᴊᴀᴅɪᴀɴ", [`◦ *${k.judul}*`, `◦ ${k.cerita}`]),
    ];

    let hadiah = null;

    if (k.jenis === "harta") {
      const koin = Math.floor(rentang(k.koin) * (1 + p.level * 0.03));
      const exp = rentang(k.exp);
      hadiah = beriHadiah(db, m.sender, koin, exp);
      bagian.push(
        "\n\n",
        bracketBox("💰", "ᴛᴇᴍᴜᴀɴ", [
          `◦ Koin: *+${angka(hadiah.koin)}*`,
          `◦ Exp: *+${angka(hadiah.exp)}*`,
        ]),
      );
    } else if (k.jenis === "barang") {
      tambahBarang(db, m.sender, k.barang, k.jumlah);
      const exp = rentang(k.exp);
      hadiah = beriHadiah(db, m.sender, 0, exp);
      bagian.push(
        "\n\n",
        bracketBox("🎒", "ᴛᴇᴍᴜᴀɴ", [
          `◦ *${k.barang.replace(/_/g, " ")}* × ${k.jumlah}`,
          `◦ Exp: *+${angka(hadiah.exp)}*`,
        ]),
      );
    } else if (k.jenis === "peti") {
      tambahBarang(db, m.sender, "peti_harta", 1);
      const exp = rentang(k.exp);
      hadiah = beriHadiah(db, m.sender, 0, exp);
      bagian.push(
        "\n\n",
        bracketBox("🎁", "ᴛᴇᴍᴜᴀɴ", [
          "◦ *Peti Harta* × 1",
          `◦ Exp: *+${angka(hadiah.exp)}*`,
          `◦ Buka dengan *${prefix}tasrpg buka*`,
        ]),
      );
    } else if (k.jenis === "jebakan") {
      const luka = Math.floor(
        p.hpMaks * (k.lukaPersen[0] + Math.random() * (k.lukaPersen[1] - k.lukaPersen[0])),
      );
      const hpBaru = Math.max(1, p.hp - luka);
      simpanPemain(db, m.sender, { hp: hpBaru });
      bagian.push(
        "\n\n",
        bracketBox("🩸", "ᴄᴇʟᴀᴋᴀ", [
          `◦ HP berkurang: *-${angka(luka)}*`,
          `◦ HP: ${bar(hpBaru, p.hpMaks, 8)} *${angka(hpBaru)}/${angka(p.hpMaks)}*`,
        ]),
      );
    } else {
      bagian.push(
        "\n\n",
        bracketBox("🍃", "ʜᴀꜱɪʟ", ["◦ Tidak ada temuan kali ini."]),
      );
    }

    if (hadiah?.naikLevel) {
      bagian.push(
        "\n\n",
        bracketBox("🎉", "ɴᴀɪᴋ ʟᴇᴠᴇʟ", [
          `◦ Level *${hadiah.levelLama}* → *${hadiah.levelBaru}*`,
        ]),
      );
    }

    const sesudah = ambilPemain(db, m.sender);
    bagian.push(
      "\n\n",
      bracketBox("⚡", "ꜱᴛᴀᴍɪɴᴀ", [
        `◦ Sisa: *${sesudah.stamina}/${STAMINA_MAKS}*`,
      ]),
      "\n\n",
      separator(),
      "\n",
      tipText(`${prefix}explore lagi untuk kejadian berbeda`),
    );

    await m.reply(bagian.join(""));
  } catch (error) {
    await m.reply(
      alyaHeader("Gagal", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ Alasan: *${String(error.message).slice(0, 120)}*`]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Ketik ${prefix}explore untuk mencoba lagi`),
    );
  }

  return { handled: true };
}

export default { config: pluginConfig, handler };
export { KEJADIAN, undiKejadian };
