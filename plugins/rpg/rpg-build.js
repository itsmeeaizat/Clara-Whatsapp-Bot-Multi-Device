import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "build",
  alias: ["craft", "buat"],
  category: "rpg",
  description: "Membuat peralatan atau bangunan dari bahan mentah",
  usage: ".build <nama_item>",
  example: ".build kapak",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const recipes = {
  kapak: { wood: 10, iron: 5, name: "🪓 Kapak Kayu" },
  pancingan: { wood: 15, iron: 2, name: "🎣 Pancingan" },
  cangkul: { wood: 8, stone: 8, name: "⛏️ Cangkul" },
  kandang: { wood: 30, stone: 20, iron: 10, name: "🏠 Kandang Hewan" },
  rumah: { wood: 100, stone: 100, iron: 50, name: "🏰 Rumah RPG" },
};

async function handler(m, { sock, args }) {
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
    const itemArg = args[0] ? args[0].toLowerCase() : null;

    if (!itemArg || !recipes[itemArg]) {
      let catalog = "🔨 *RESEP CRAFTING / BUILD*\n\n";
      for (const [key, val] of Object.entries(recipes)) {
        let req = [];
        if (val.wood) req.push("🪵 Kayu: " + val.wood);
        if (val.stone) req.push("🪨 Batu: " + val.stone);
        if (val.iron) req.push("⛓️ Besi: " + val.iron);
        catalog += "*" + val.name + "* (.build " + key + ")\n   Syarat: " + req.join(", ") + "\n\n";
      }
      catalog += "🪵 Kayumu: *" + (user.wood || 0) + "* | 🪨 Batumu: *" + (user.stone || 0) + "* | ⛓️ Besimu: *" + (user.iron || 0) + "*";
      return await m.reply(catalog);
    }

    const recipe = recipes[itemArg];
    const userWood = user.wood || 0;
    const userStone = user.stone || 0;
    const userIron = user.iron || 0;

    if ((recipe.wood && userWood < recipe.wood) ||
        (recipe.stone && userStone < recipe.stone) ||
        (recipe.iron && userIron < recipe.iron)) {
      return await m.reply(`❌ Bahanmu tidak cukup untuk membuat *${recipe.name}*!`);
    }

    if (recipe.wood) user.wood -= recipe.wood;
    if (recipe.stone) user.stone -= recipe.stone;
    if (recipe.iron) user.iron -= recipe.iron;

    user[itemArg] = (user[itemArg] || 0) + 1;
    if (itemArg === "kapak") user.kapak_durability = 100;
    if (itemArg === "pancingan") user.pancingan_durability = 100;

    await db.write();

    await m.reply(`🎉 *BERHASIL MEMBUAT ${recipe.name.toUpperCase()}!*\n\nBarang telah ditambahkan ke inventaris milikmu.`);
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
