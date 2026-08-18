import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "kandang",
  alias: ["petlist", "mypets"],
  category: "rpg",
  description: "Menampilkan hewan peliharaan yang berada di kandang milikmu",
  usage: ".kandang",
  example: ".kandang",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    if (!db.data) db.data = {};
    if (!db.data.users) db.data.users = {};
    if (!db.data.users[m.sender]) {
      db.data.users[m.sender] = {
        money: 0,
        exp: 0,
        level: 1,
        health: 100,
        hunger: 50,
        stamina: 100,
      };
      await db.write();
    }

    const user = db.data.users[m.sender];

    const petIcons = {
      kucing: "🐱 Kucing Lucu",
      rubah: "🦊 Rubah Cerdik",
      kuda: "🐴 Kuda Cepat",
      naga: "🐉 Naga Api",
    };

    let ownedPets = [];

    for (const [key, label] of Object.entries(petIcons)) {
      if (user[key]) {
        const lvl = user[key + "_level"] || 1;
        const exp = user[key + "_exp"] || 0;
        ownedPets.push(label + "\n   └ Level: *" + lvl + "* | EXP: *" + exp + "/" + (lvl * 100) + "*");
      }
    }

    if (ownedPets.length === 0) {
      return await m.reply("🛖 *KANDANG HEWAN KOSONG*\n\nKamu belum memiliki hewan peliharaan! Kunjungi .petstore untuk membeli pet pertamamu.");
    }

    await m.reply(
      "🛖 *KANDANG HEWAN PELIHARAAN*\n\n" +
      ownedPets.join("\n\n") + "\n\n" +
      "💡 *Tips:* Beri makan pet milikmu dengan .feed <nama_pet>!"
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
